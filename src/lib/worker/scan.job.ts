import { db } from '../db';
import { WatchProviderRegistry } from '../providers';
import { AIIntelligenceService } from '../ai/intelligence.service';
import { logger } from '../utils/logger';
import { WatchType } from '@/types';

export async function executeWatchScan(watchId: string): Promise<{ success: boolean; eventCreated: boolean; error?: string }> {
  const watch = await db.watch.findUnique({
    where: { id: watchId },
    include: {
      user: true,
      snapshots: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!watch) {
    throw new Error(`Watch ${watchId} not found.`);
  }

  logger.info(`[Scan-Job] Starting scan for watch "${watch.name}" (${watch.type}) - Target: ${watch.target}`);
  const startTime = Date.now();

  try {
    const provider = WatchProviderRegistry.getProvider(watch.type as WatchType);
    const lastSnapshot = watch.snapshots[0];
    const lastMetadata = lastSnapshot?.metadata ? JSON.parse(lastSnapshot.metadata) : undefined;

    // Fetch latest content
    const fetchResult = await provider.fetchLatest(watch.target, lastMetadata);

    // Compare with last snapshot
    const compareResult = await provider.compareSnapshots(
      lastSnapshot?.normalized || '',
      lastMetadata,
      fetchResult
    );

    let eventCreated = false;

    if (compareResult.hasChanged || !lastSnapshot) {
      logger.info(`[Scan-Job] Content change detected for "${watch.name}". Running AI Intelligence pipeline...`);

      const keywords = watch.keywords ? JSON.parse(watch.keywords) : [];

      const aiResult = await AIIntelligenceService.analyzeChange({
        userId: watch.userId,
        watchName: watch.name,
        target: watch.target,
        watchType: watch.type,
        targetImportance: watch.targetImportance,
        aiInstructions: watch.aiInstructions,
        keywords,
        diffSummary: compareResult.diffSummary || 'Content modified.',
        normalizedBefore: compareResult.normalizedBefore,
        normalizedAfter: compareResult.normalizedAfter,
      });

      // Save new Snapshot
      const newSnapshot = await db.watchSnapshot.create({
        data: {
          watchId: watch.id,
          hash: fetchResult.hash,
          rawContent: fetchResult.rawContent,
          normalized: fetchResult.normalizedContent,
          metadata: fetchResult.metadata ? JSON.stringify(fetchResult.metadata) : null,
        },
      });

      if (aiResult.isMeaningful) {
        // Create ChangeEvent
        const changeEvent = await db.changeEvent.create({
          data: {
            watchId: watch.id,
            eventType: compareResult.eventType || 'CONTENT_UPDATE',
            rawBefore: fetchResult.rawContent ? fetchResult.rawContent.substring(0, 10000) : null,
            rawAfter: fetchResult.rawContent ? fetchResult.rawContent.substring(0, 10000) : null,
            normalizedBefore: compareResult.normalizedBefore,
            normalizedAfter: compareResult.normalizedAfter,
            diffSummary: compareResult.diffSummary,
            importance: aiResult.importance,
            confidence: aiResult.confidence,
            category: aiResult.category,
            whatChanged: aiResult.whatChanged,
            whyItMatters: aiResult.whyItMatters,
            recommendedAction: aiResult.recommendedAction,
            aiSummary: aiResult.summary,
            affectedAreas: JSON.stringify(aiResult.affectedAreas),
            tags: JSON.stringify(aiResult.tags),
            status: 'NEW',
            isMeaningful: true,
          },
        });

        // Create AIAnalysis log record
        await db.aIAnalysis.create({
          data: {
            eventId: changeEvent.id,
            modelUsed: aiResult.modelUsed,
            promptTokens: Math.round(aiResult.tokensUsed * 0.7),
            completionTokens: Math.round(aiResult.tokensUsed * 0.3),
            rawPrompt: aiResult.rawPrompt,
            rawResponse: aiResult.rawResponse,
            parsedOutput: JSON.stringify(aiResult),
          },
        });

        // Create In-App Notification if severity meets user preference
        await db.notification.create({
          data: {
            userId: watch.userId,
            eventId: changeEvent.id,
            title: `[${aiResult.importance}] ${watch.name}: ${aiResult.summary.substring(0, 80)}`,
            message: aiResult.whyItMatters,
            severity: aiResult.importance,
            isRead: false,
          },
        });

        eventCreated = true;
      }
    } else {
      logger.info(`[Scan-Job] No change detected for "${watch.name}".`);
    }

    // Update Watch timestamps
    const nextCheck = new Date(Date.now() + watch.checkIntervalMins * 60 * 1000);
    await db.watch.update({
      where: { id: watch.id },
      data: {
        lastCheckedAt: new Date(),
        nextCheckAt: nextCheck,
        status: 'ACTIVE',
        lastErrorMessage: null,
      },
    });

    // Log successful job execution
    await db.jobLog.create({
      data: {
        watchId: watch.id,
        jobType: 'SCAN_WATCH',
        status: 'SUCCESS',
        details: eventCreated ? 'Change detected and alert created.' : 'Scan completed. No change detected.',
        durationMs: Date.now() - startTime,
      },
    });

    return { success: true, eventCreated };
  } catch (err: any) {
    logger.error(`[Scan-Job] Error scanning watch ${watch.id}: ${err.message}`);

    await db.watch.update({
      where: { id: watch.id },
      data: {
        status: 'ERROR',
        lastErrorMessage: err.message,
        lastCheckedAt: new Date(),
      },
    });

    await db.jobLog.create({
      data: {
        watchId: watch.id,
        jobType: 'SCAN_WATCH',
        status: 'FAILED',
        details: err.message,
        durationMs: Date.now() - startTime,
      },
    });

    return { success: false, eventCreated: false, error: err.message };
  }
}

export async function runPendingScans(): Promise<number> {
  const pendingWatches = await db.watch.findMany({
    where: {
      status: { in: ['ACTIVE', 'PENDING'] },
      OR: [{ nextCheckAt: { lte: new Date() } }, { nextCheckAt: null }],
    },
  });

  logger.info(`[Worker] Found ${pendingWatches.length} pending watch scans.`);
  let processed = 0;

  for (const watch of pendingWatches) {
    try {
      await executeWatchScan(watch.id);
      processed++;
    } catch (e: any) {
      logger.error(`[Worker] Watch ${watch.id} scan execution failed: ${e.message}`);
    }
  }

  return processed;
}
