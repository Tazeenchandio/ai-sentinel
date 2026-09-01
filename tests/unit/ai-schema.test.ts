import { StructuredAIAnalysisSchema, TriageResponseSchema } from '../../src/lib/ai/schemas';

describe('AI Response Zod Schema Validation', () => {
  it('should successfully parse valid AI Triage responses', () => {
    const validTriage = {
      isMeaningful: true,
      reasoning: 'Non-cosmetic version release detected',
      suggestedImportance: 'HIGH',
    };
    expect(() => TriageResponseSchema.parse(validTriage)).not.toThrow();
  });

  it('should parse valid Deep Analysis structured output', () => {
    const validAnalysis = {
      isMeaningful: true,
      importance: 'CRITICAL',
      category: 'breaking_change',
      confidence: 0.95,
      whatChanged: 'SDK signature refactored',
      whyItMatters: 'Breaks existing callers',
      recommendedAction: 'Upgrade tool schema',
      summary: 'Critical breaking change',
      affectedAreas: ['API Client'],
      tags: ['breaking'],
    };
    expect(() => StructuredAIAnalysisSchema.parse(validAnalysis)).not.toThrow();
  });
});
