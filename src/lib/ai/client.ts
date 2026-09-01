import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

const apiKey = process.env.ANTHROPIC_API_KEY;
export const isMockAI = !apiKey || apiKey === 'mock-key-for-development' || apiKey.includes('your_anthropic_api_key');

const anthropic = !isMockAI ? new Anthropic({ apiKey }) : null;

export const AI_MODELS = {
  triage: process.env.AI_TRIAGE_MODEL || 'claude-3-5-haiku-20241022',
  analysis: process.env.AI_ANALYSIS_MODEL || 'claude-3-5-sonnet-20241022',
  deepAnalysis: process.env.AI_DEEP_ANALYSIS_MODEL || 'claude-3-5-sonnet-20241022',
};

export async function callClaudeStructured<T>(
  model: string,
  systemPrompt: string,
  userMessage: string,
  parser: (text: string) => T
): Promise<{ result: T; rawResponse: string; tokensUsed: number }> {
  if (isMockAI || !anthropic) {
    logger.info(`[AI-Client] Mock AI execution for model ${model}`);
    return getMockAIResponse(userMessage, parser);
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1500,
      temperature: 0.1,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textContent = response.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as any).text)
      .join('\n');

    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    let jsonString = textContent.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const result = parser(jsonString);
    return { result, rawResponse: textContent, tokensUsed };
  } catch (err: any) {
    logger.error(`[AI-Client] Call failed: ${err.message}`);
    throw err;
  }
}

function getMockAIResponse<T>(userMessage: string, parser: (text: string) => T): { result: T; rawResponse: string; tokensUsed: number } {
  // Isolate evidence content ONLY (ignore user instructions, watch name, and keywords)
  let evidenceText = userMessage;

  if (userMessage.includes('EVIDENCE ITEM 1 - SEMANTIC DIFF SUMMARY:')) {
    const item1 = userMessage.split('EVIDENCE ITEM 1 - SEMANTIC DIFF SUMMARY:')[1] || '';
    const diffPart = item1.split('EVIDENCE ITEM 2')[0] || '';
    const item3 = userMessage.split('EVIDENCE ITEM 3 - LATEST SNAPSHOT CONTENT (AFTER):')[1] || '';
    const afterPart = item3.split('EVIDENCE-GROUNDING RULES')[0] || '';
    evidenceText = `${diffPart} ${afterPart}`;
  }

  const lowerEvidence = evidenceText.toLowerCase();

  const hasSecurityEvidence =
    lowerEvidence.includes('cve-') ||
    lowerEvidence.includes('ghsa-') ||
    lowerEvidence.includes('vulnerability patch') ||
    lowerEvidence.includes('security patch') ||
    lowerEvidence.includes('security fix') ||
    lowerEvidence.includes('buffer overflow');

  const hasBreakingEvidence =
    !hasSecurityEvidence &&
    (lowerEvidence.includes('breaking') ||
      lowerEvidence.includes('deprecated') ||
      lowerEvidence.includes('removed api') ||
      lowerEvidence.includes('signature change'));

  const isDocOnly =
    !hasSecurityEvidence &&
    !hasBreakingEvidence &&
    (lowerEvidence.includes('readme') || lowerEvidence.includes('docs') || lowerEvidence.includes('typo'));

  const isInsufficient =
    !hasSecurityEvidence &&
    !hasBreakingEvidence &&
    (lowerEvidence.includes('no line diff available') ||
      lowerEvidence.includes('insufficient_test_trigger') ||
      lowerEvidence.trim().length < 20);

  let category: any = 'product_update';
  let importance: any = 'MEDIUM';
  let isSecurityConfirmed = false;
  let confidence = 0.92;
  let whatChanged = '';
  let whyItMatters = '';
  let recommendedAction = '';
  let summary = '';
  let evidenceSummary = '';
  let evidenceConfidenceReason = '';

  if (hasSecurityEvidence) {
    category = 'security';
    importance = 'CRITICAL';
    isSecurityConfirmed = true;
    confidence = 0.98;
    summary = 'Confirmed Critical Security Vulnerability Patch Detected';
    whatChanged = 'Detected security vulnerability patch in source evidence matching security advisory keywords.';
    whyItMatters = 'Direct security vulnerability fix identified in source release/commit diff.';
    recommendedAction = 'Audit your dependencies immediately and deploy the security patch.';
    evidenceSummary = 'Source diff explicitly contains security vulnerability patch identifiers.';
    evidenceConfidenceReason = 'High confidence due to explicit CVE/GHSA or security patch keywords in diff.';
  } else if (hasBreakingEvidence) {
    category = 'breaking_change';
    importance = 'HIGH';
    confidence = 0.94;
    summary = 'Breaking API Signature Change Detected';
    whatChanged = 'Source diff contains deprecated or refactored API signatures.';
    whyItMatters = 'Upgrading without updating function calls may cause runtime compilation or execution breaks.';
    recommendedAction = 'Review modified API method signatures and update your implementation before upgrading.';
    evidenceSummary = 'Source diff contains breaking change / deprecation keywords.';
    evidenceConfidenceReason = 'High confidence backed by explicit deprecation diff lines.';
  } else if (isDocOnly) {
    category = 'documentation';
    importance = 'LOW';
    confidence = 0.96;
    summary = 'Documentation and Formatting Update';
    whatChanged = 'Documentation, README text, or non-functional formatting updates detected.';
    whyItMatters = 'Changes are limited to documentation files without altering core API behavior.';
    recommendedAction = 'No code refactoring required.';
    evidenceSummary = 'Diff contains only documentation or formatting modifications.';
    evidenceConfidenceReason = 'High confidence due to isolated documentation changes.';
  } else if (isInsufficient) {
    category = 'informational';
    importance = 'LOW';
    confidence = 0.52;
    summary = 'Update Detected with Insufficient Detailed Evidence';
    whatChanged = 'Content update detected, but full release notes or line diffs were limited.';
    whyItMatters = 'Insufficient evidence to determine security impact.';
    recommendedAction = 'Inspect the source repository directly to verify additional context.';
    evidenceSummary = 'Raw content diff lacks explicit detail or release notes.';
    evidenceConfidenceReason = 'Low confidence score assigned due to limited source diff information.';
  } else {
    category = 'product_update';
    importance = 'MEDIUM';
    confidence = 0.90;
    summary = 'Standard Product / Feature Update';
    whatChanged = 'Monitored target updated with new commit activity or minor version release.';
    whyItMatters = 'Includes feature updates and performance improvements.';
    recommendedAction = 'Review full diff in Sentinel dashboard to stay updated.';
    evidenceSummary = 'Standard commit log and repository updates present in source snapshot.';
    evidenceConfidenceReason = 'Medium confidence based on repository commit history.';
  }

  const mockPayload = {
    isMeaningful: !isDocOnly || userMessage.includes('aiInstructions'),
    importance,
    category,
    confidence,
    isSecurityConfirmed,
    evidenceSummary,
    evidenceConfidenceReason,
    whatChanged,
    whyItMatters,
    recommendedAction,
    summary,
    affectedAreas: ['Core Module', 'API Integration'],
    tags: [category, 'evidence-grounded'],
    reasoning: 'AI Triage decision strictly evaluated against source diff evidence.',
    suggestedImportance: importance,
  };

  const rawResponse = JSON.stringify(mockPayload, null, 2);
  let parsedResult: T;
  try {
    parsedResult = parser(rawResponse);
  } catch (e) {
    parsedResult = mockPayload as any;
  }

  return {
    result: parsedResult,
    rawResponse,
    tokensUsed: 250,
  };
}
