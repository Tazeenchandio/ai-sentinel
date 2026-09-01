import { FetchResult, CompareResult, WatchType } from '@/types';
import crypto from 'crypto';

export abstract class BaseWatchProvider {
  abstract type: WatchType;

  abstract fetchLatest(target: string, lastMetadata?: Record<string, any>): Promise<FetchResult>;

  abstract compareSnapshots(
    oldNormalized: string,
    oldMetadata: Record<string, any> | undefined,
    newResult: FetchResult
  ): Promise<CompareResult>;

  protected computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
