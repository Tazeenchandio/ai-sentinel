import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding AI Sentinel production-grade demo data...');

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('demo12345', 10);
  const demoUser = await db.user.upsert({
    where: { email: 'demo@sentinel.dev' },
    update: { passwordHash },
    create: {
      email: 'demo@sentinel.dev',
      name: 'Alex Vance (Lead AI Architect)',
      passwordHash,
      role: 'ADMIN',
      isDemo: true,
      preferences: {
        create: {
          emailAlerts: true,
          minNotificationLevel: 'MEDIUM',
          digestFrequency: 'DAILY',
        },
      },
    },
  });

  console.log(`✅ Demo User created: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Clear previous watches & events for clean seed state
  await db.watch.deleteMany({ where: { userId: demoUser.id } });

  // 3. Create Sample Watches
  const ghWatch = await db.watch.create({
    data: {
      userId: demoUser.id,
      name: 'Anthropic TypeScript SDK',
      description: 'Official Anthropic TypeScript / Node API library repo',
      type: 'GITHUB_REPO',
      target: 'anthropic-ai/anthropic-sdk-typescript',
      checkIntervalMins: 30,
      targetImportance: 'HIGH',
      keywords: JSON.stringify(['breaking', 'streaming', 'tools', 'claude-3-5']),
      aiInstructions: 'Alert me immediately on new major releases or breaking API signature changes.',
      status: 'ACTIVE',
      lastCheckedAt: new Date(Date.now() - 1000 * 60 * 15),
      nextCheckAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  const webWatch = await db.watch.create({
    data: {
      userId: demoUser.id,
      name: 'OpenAI API Pricing & Models Page',
      description: 'Public OpenAI model documentation & pricing breakdown',
      type: 'WEBSITE',
      target: 'https://openai.com/api/pricing',
      checkIntervalMins: 60,
      targetImportance: 'CRITICAL',
      keywords: JSON.stringify(['gpt-5', 'pricing', 'tier', 'token', 'rate limits']),
      aiInstructions: 'Focus on price decreases, new tier additions, or deprecation notices.',
      status: 'ACTIVE',
      lastCheckedAt: new Date(Date.now() - 1000 * 60 * 45),
      nextCheckAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  const rssWatch = await db.watch.create({
    data: {
      userId: demoUser.id,
      name: 'GitHub Engineering Blog',
      description: 'Updates from GitHub engineering team on infrastructure & AI',
      type: 'RSS_FEED',
      target: 'https://github.blog/engineering/feed/',
      checkIntervalMins: 120,
      targetImportance: 'MEDIUM',
      keywords: JSON.stringify(['copilot', 'actions', 'security', 'architecture']),
      aiInstructions: 'Highlight architectural articles or new developer tool announcements.',
      status: 'ACTIVE',
      lastCheckedAt: new Date(Date.now() - 1000 * 60 * 90),
      nextCheckAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  const topicWatch = await db.watch.create({
    data: {
      userId: demoUser.id,
      name: 'Autonomous AI Coding Agents',
      description: 'Monitoring open-source repos & advancements in AI coding agents',
      type: 'TOPIC_WATCH',
      target: 'AI coding agent autonomous repository editing',
      checkIntervalMins: 180,
      targetImportance: 'HIGH',
      keywords: JSON.stringify(['agent', 'swe-bench', 'code generator', 'refactor']),
      aiInstructions: 'Alert when new top-tier agent frameworks emerge or benchmark records are set.',
      status: 'ACTIVE',
      lastCheckedAt: new Date(Date.now() - 1000 * 60 * 120),
      nextCheckAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  console.log('✅ Created 4 sample watches.');

  // 4. Create Historical Snapshots & Intelligence Change Events

  // Event 1: Critical Security / Breaking Release
  const event1 = await db.changeEvent.create({
    data: {
      watchId: ghWatch.id,
      eventType: 'NEW_RELEASE',
      rawBefore: 'v0.25.0 release content',
      rawAfter: 'v0.26.0 major release notes with streaming tools upgrade',
      normalizedBefore: 'RELEASE v0.25.0: Legacy tool schema format.',
      normalizedAfter: 'RELEASE v0.26.0: Deprecated legacy tool call format. Replaced with strict JSON Schema validation.',
      diffSummary: '- Deprecated legacy tool format\n+ Strict JSON schema enforcement on all tool calls',
      importance: 'CRITICAL',
      confidence: 0.96,
      category: 'breaking_change',
      whatChanged: 'Anthropic SDK released v0.26.0, deprecating legacy tool definitions in favor of strict Zod/JSON schema definitions.',
      whyItMatters: 'Existing code using custom prompt tool schemas will break upon upgrading without migrating to the new schema parser.',
      recommendedAction: 'Audit all `anthropic.messages.create` tool definitions and convert to the new `input_schema` object structure.',
      aiSummary: 'Critical Breaking Change: Tool calling schema signature refactored in SDK v0.26.0.',
      affectedAreas: JSON.stringify([]),
      tags: JSON.stringify([]),
      status: 'ACTION_REQUIRED',
      isMeaningful: true,
      detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
  });

  await db.notification.create({
    data: {
      userId: demoUser.id,
      eventId: event1.id,
      title: '[CRITICAL] Anthropic SDK: Tool calling schema signature refactored in v0.26.0',
      message: 'Existing code using custom prompt tool schemas will break upon upgrading.',
      severity: 'CRITICAL',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  });

  // Event 2: High Importance Pricing / Model Update
  const event2 = await db.changeEvent.create({
    data: {
      watchId: webWatch.id,
      eventType: 'DOM_CONTENT_CHANGE',
      normalizedBefore: 'GPT-4o Input: $5.00 / 1M tokens. Output: $15.00 / 1M tokens.',
      normalizedAfter: 'GPT-4o Input: $2.50 / 1M tokens. Output: $10.00 / 1M tokens. New Batch API: 50% discount.',
      diffSummary: '- GPT-4o Input: $5.00 / 1M tokens\n+ GPT-4o Input: $2.50 / 1M tokens (50% price reduction)',
      importance: 'HIGH',
      confidence: 0.98,
      category: 'pricing',
      whatChanged: 'OpenAI reduced GPT-4o input token pricing by 50% from $5.00 to $2.50 per 1M tokens.',
      whyItMatters: 'Significant operational cost reduction for high-volume background scanning and evaluation pipelines.',
      recommendedAction: 'Update internal AI cost modeling and budget forecasts.',
      aiSummary: '50% Price Reduction detected for GPT-4o input tokens.',
      affectedAreas: JSON.stringify([]),
      tags: JSON.stringify([]),
      status: 'NEW',
      isMeaningful: true,
      detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
  });

  await db.notification.create({
    data: {
      userId: demoUser.id,
      eventId: event2.id,
      title: '[HIGH] OpenAI Pricing: 50% reduction in GPT-4o input token cost',
      message: 'Input token cost dropped from $5.00 to $2.50 per million tokens.',
      severity: 'HIGH',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
  });

  // Event 3: Medium Importance Engineering Tech Article
  const event3 = await db.changeEvent.create({
    data: {
      watchId: rssWatch.id,
      eventType: 'NEW_RSS_ITEMS',
      normalizedBefore: 'Article List count: 14',
      normalizedAfter: 'New Article: How GitHub Copilot Workspace uses multi-agent coordination for autonomous PR creation.',
      diffSummary: '+ Title: Multi-Agent Architecture in Copilot Workspace',
      importance: 'MEDIUM',
      confidence: 0.91,
      category: 'product_update',
      whatChanged: 'GitHub published a technical architecture post detailing how agentic workers coordinate code generation.',
      whyItMatters: 'Provides architectural reference patterns for agentic workflow decomposition and automated verification.',
      recommendedAction: 'Review engineering article for agent design insights.',
      aiSummary: 'GitHub Engineering published technical deep dive on multi-agent Copilot architecture.',
      affectedAreas: JSON.stringify([]),
      tags: JSON.stringify([]),
      status: 'NEW',
      isMeaningful: true,
      detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
    },
  });

  await db.notification.create({
    data: {
      userId: demoUser.id,
      eventId: event3.id,
      title: '[MEDIUM] GitHub Blog: Architecture deep dive into multi-agent workflows',
      message: 'Details technical design of autonomous agent coordination.',
      severity: 'MEDIUM',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    },
  });

  console.log('✅ Seeded 3 rich ChangeEvents and Notifications.');
}

seed()
  .then(() => {
    console.log('🚀 Seeding complete!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  });
