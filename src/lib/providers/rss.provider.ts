import { BaseWatchProvider } from './base.provider';
import { FetchResult, CompareResult, WatchType } from '@/types';
import Parser from 'rss-parser';
import { safeFetch } from '../security/ssrf';
import { computeTextDiff } from '../utils/diff';

export class RSSProvider extends BaseWatchProvider {
  type: WatchType = 'RSS_FEED';

  async fetchLatest(target: string, lastMetadata?: Record<string, any>): Promise<FetchResult> {
    const safeRes = await safeFetch(target, { maxBytes: 5 * 1024 * 1024, timeoutMs: 10000 });
    const parser = new Parser();
    const feed = await parser.parseString(safeRes.text);

    const items = feed.items.slice(0, 15).map((item) => ({
      id: item.guid || item.link || item.title,
      title: item.title || 'Untitled',
      link: item.link || target,
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      summary: (item.contentSnippet || item.content || '').replace(/<[^>]*>?/gm, '').trim().substring(0, 500),
    }));

    const normalizedLines: string[] = [];
    normalizedLines.push(`FEED TITLE: ${feed.title || target}`);
    normalizedLines.push(`FEED LINK: ${feed.link || target}`);
    normalizedLines.push(`TOTAL ITEMS FETCHED: ${items.length}\n`);

    items.forEach((item, idx) => {
      normalizedLines.push(`ITEM #${idx + 1}: ${item.title}`);
      normalizedLines.push(`DATE: ${item.pubDate}`);
      normalizedLines.push(`LINK: ${item.link}`);
      normalizedLines.push(`SUMMARY: ${item.summary}`);
      normalizedLines.push('---');
    });

    const normalizedContent = normalizedLines.join('\n');
    const hash = this.computeHash(normalizedContent);

    return {
      rawContent: JSON.stringify(feed, null, 2).substring(0, 50000),
      normalizedContent,
      hash,
      metadata: {
        feedTitle: feed.title,
        latestItemId: items[0]?.id || null,
        itemIds: items.map((i) => i.id),
      },
    };
  }

  async compareSnapshots(
    oldNormalized: string,
    oldMetadata: Record<string, any> | undefined,
    newResult: FetchResult
  ): Promise<CompareResult> {
    if (!oldNormalized) {
      return {
        hasChanged: false,
        normalizedBefore: '',
        normalizedAfter: newResult.normalizedContent,
      };
    }

    const previousIds = new Set(oldMetadata?.itemIds || []);
    const newItems = (newResult.metadata?.itemIds || []).filter((id: string) => !previousIds.has(id));

    const diff = computeTextDiff(oldNormalized, newResult.normalizedContent);

    return {
      hasChanged: newItems.length > 0 || diff.isSignificant,
      normalizedBefore: oldNormalized,
      normalizedAfter: newResult.normalizedContent,
      diffSummary: diff.formattedDiff,
      eventType: 'NEW_RSS_ITEMS',
    };
  }
}
