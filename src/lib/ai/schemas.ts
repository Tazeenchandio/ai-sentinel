import { z } from 'zod';

export const TriageResponseSchema = z.object({
  isMeaningful: z.boolean(),
  reasoning: z.string(),
  suggestedImportance: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const StructuredAIAnalysisSchema = z.object({
  isMeaningful: z.boolean(),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.enum([
    'product_update',
    'breaking_change',
    'security',
    'documentation',
    'cosmetic',
    'pricing',
    'policy',
    'major_release',
    'informational',
  ]),
  confidence: z.number().min(0).max(1),
  isSecurityConfirmed: z.boolean().default(false),
  evidenceSummary: z.string().default('Grounded in detected snapshot diff.'),
  evidenceConfidenceReason: z.string().default('Confidence based on explicit source content evidence.'),
  whatChanged: z.string(),
  whyItMatters: z.string(),
  recommendedAction: z.string().default('Review the changes to assess potential impact.'),
  summary: z.string(),
  affectedAreas: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});
