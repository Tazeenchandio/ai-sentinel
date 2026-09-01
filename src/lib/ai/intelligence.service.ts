import { callClaudeStructured, AI_MODELS } from './client';
import { SYSTEM_TRIAGE_PROMPT, SYSTEM_DEEP_ANALYSIS_PROMPT } from './prompts';
import { TriageResponseSchema, StructuredAIAnalysisSchema } from './schemas';
import { StructuredAIAnalysis } from '@/types';
import { db } from '../db';
import { logger } from '../utils/logger';

export class AIIntelligenceService {
  static async analyzeChange(params: {
    userId?: string;
    watchName: string;
    target: string;
    watchType: string;
    targetImportance: string;
    aiInstructions?: string | null;
    keywords?: string[];
    diffSummary: string;
    normalizedBefore?: string | null;
    normalizedAfter?: string | null;
  }): Promise<StructuredAIAnalysis & { tokensUsed: number; rawPrompt: string; rawResponse: string; modelUsed: string }> {
    const {
      userId,
      watchName,
      target,
      watchType,
      targetImportance,
      aiInstructions,
      keywords,
      diffSummary,
      normalizedBefore,
      normalizedAfter,
    } = params;

    // Structured Evidence Dataset passed to AI Analysis
    const contextPrompt = `
EVIDENCE DATASET FOR AI ANALYSIS:
--------------------------------------------------
WATCH NAME: ${watchName}
TYPE: ${watchType}
TARGET RESOURCE / URL: ${target}
USER TARGET IMPORTANCE THRESHOLD: ${targetImportance}
USER CUSTOM INSTRUCTIONS: ${aiInstructions || 'None provided. Alert on meaningful updates.'}
WATCH KEYWORDS: ${keywords?.length ? keywords.join(', ') : 'None'}

EVIDENCE ITEM 1 - SEMANTIC DIFF SUMMARY:
${(diffSummary || 'No line diff available.').substring(0, 3000)}

EVIDENCE ITEM 2 - PREVIOUS SNAPSHOT CONTENT (BEFORE):
${(normalizedBefore || 'No previous snapshot available (first scan)').substring(0, 1500)}

EVIDENCE ITEM 3 - LATEST SNAPSHOT CONTENT (AFTER):
${(normalizedAfter || 'No snapshot content available').substring(0, 2000)}

EVIDENCE-GROUNDING RULES:
- Base analysis ONLY on Evidence Items 1, 2, and 3.
- NEVER mark as "security" or "CRITICAL" unless Evidence Items contain explicit security terms (CVE ID, GHSA advisory, or explicit security fix notes).
- If evidence is vague, state: "Insufficient evidence to determine security impact." in whyItMatters.
`;

    logger.info(`[AI-Intelligence] Running Triage for watch "${watchName}"...`);
    let triageResult;
    try {
      triageResult = await callClaudeStructured(
        AI_MODELS.triage,
        SYSTEM_TRIAGE_PROMPT,
        contextPrompt,
        (text) => TriageResponseSchema.parse(JSON.parse(text))
      );
    } catch (e: any) {
      logger.warn(`[AI-Intelligence] Triage JSON parse failed (${e.message}), defaulting to meaningful.`);
      triageResult = {
        result: { isMeaningful: true, reasoning: 'Fallback triage due to parse error', suggestedImportance: 'MEDIUM' as const },
        rawResponse: '',
        tokensUsed: 100,
      };
    }

    if (!triageResult.result.isMeaningful && (!aiInstructions || aiInstructions.trim().length === 0)) {
      logger.info(`[AI-Intelligence] Change classified as noise during Triage.`);
      return {
        isMeaningful: false,
        importance: 'LOW',
        category: 'informational',
        confidence: 0.85,
        isSecurityConfirmed: false,
        evidenceSummary: 'Content diff contains no substantive modifications.',
        evidenceConfidenceReason: 'High confidence based on empty or whitespace-only diff.',
        whatChanged: 'Minor non-substantive change detected.',
        whyItMatters: 'Triage filter determined this change contains non-critical text or formatting updates.',
        recommendedAction: 'No action required.',
        summary: 'Insignificant change filtered out by AI Triage.',
        affectedAreas: [],
        tags: ['filtered-noise'],
        tokensUsed: triageResult.tokensUsed,
        rawPrompt: contextPrompt,
        rawResponse: triageResult.rawResponse,
        modelUsed: AI_MODELS.triage,
      };
    }

    logger.info(`[AI-Intelligence] Running Deep Analysis for watch "${watchName}"...`);
    let deepResult;
    try {
      deepResult = await callClaudeStructured(
        AI_MODELS.analysis,
        SYSTEM_DEEP_ANALYSIS_PROMPT,
        contextPrompt,
        (text) => StructuredAIAnalysisSchema.parse(JSON.parse(text))
      );
    } catch (e: any) {
      logger.warn(`[AI-Intelligence] Deep analysis parse error (${e.message}), constructing safe fallback analysis.`);
      deepResult = {
        result: {
          isMeaningful: true,
          importance: (targetImportance as any) || 'MEDIUM',
          category: 'product_update' as const,
          confidence: 0.75,
          isSecurityConfirmed: false,
          evidenceSummary: 'Fallback analysis due to parse error.',
          evidenceConfidenceReason: 'Fallback result.',
          whatChanged: 'Detected content modifications in watched target.',
          whyItMatters: 'The watched item was updated. Review diff for specific details.',
          recommendedAction: 'Inspect the detailed diff in Sentinel dashboard.',
          summary: 'Update detected in watched resource.',
          affectedAreas: ['Watched Resource'],
          tags: ['automated-analysis'],
        },
        rawResponse: '',
        tokensUsed: 150,
      };
    }

    const totalTokens = triageResult.tokensUsed + deepResult.tokensUsed;

    if (userId) {
      db.aIUsageLog
        .create({
          data: {
            userId,
            model: AI_MODELS.analysis,
            tokens: totalTokens,
            costEst: (totalTokens / 1000) * 0.003,
            purpose: 'DEEP_ANALYSIS',
          },
        })
        .catch((err) => logger.error(`Failed to log AI Usage: ${err.message}`));
    }

    return {
      ...deepResult.result,
      tokensUsed: totalTokens,
      rawPrompt: contextPrompt,
      rawResponse: deepResult.rawResponse,
      modelUsed: AI_MODELS.analysis,
    };
  }
}
