export type Role = 'USER' | 'ADMIN';
export type WatchType = 'GITHUB_REPO' | 'WEBSITE' | 'RSS_FEED' | 'TOPIC_WATCH';
export type WatchStatus = 'ACTIVE' | 'PAUSED' | 'ERROR' | 'PENDING';
export type ImportanceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EventStatus = 'NEW' | 'INVESTIGATING' | 'ACTION_REQUIRED' | 'RESOLVED' | 'IGNORED';

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isDemo: boolean;
}

export interface FetchResult {
  rawContent: string;
  normalizedContent: string;
  hash: string;
  metadata?: Record<string, any>;
}

export interface CompareResult {
  hasChanged: boolean;
  rawBefore?: string;
  rawAfter?: string;
  normalizedBefore?: string;
  normalizedAfter?: string;
  diffSummary?: string;
  eventType?: string;
}

export interface TriageResult {
  isMeaningful: boolean;
  reasoning: string;
  suggestedImportance: ImportanceLevel;
}

export interface StructuredAIAnalysis {
  isMeaningful: boolean;
  importance: ImportanceLevel;
  category: 'product_update' | 'breaking_change' | 'security' | 'documentation' | 'cosmetic' | 'pricing' | 'policy' | 'major_release' | 'informational';
  confidence: number;
  isSecurityConfirmed?: boolean;
  evidenceSummary?: string;
  evidenceConfidenceReason?: string;
  whatChanged: string;
  whyItMatters: string;
  recommendedAction: string;
  summary: string;
  affectedAreas: string[];
  tags: string[];
}
