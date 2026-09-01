import { BaseWatchProvider } from './base.provider';
import { FetchResult, CompareResult, WatchType } from '@/types';
import { safeFetch } from '../security/ssrf';
import { computeTextDiff } from '../utils/diff';
import { JSDOM } from 'jsdom';

export class WebsiteProvider extends BaseWatchProvider {
  type: WatchType = 'WEBSITE';

  async fetchLatest(target: string, lastMetadata?: Record<string, any>): Promise<FetchResult> {
    const response = await safeFetch(target, { maxBytes: 5 * 1024 * 1024, timeoutMs: 10000 });
    const html = response.text;

    // Normalize HTML using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove noise tags: script, style, noscript, iframe, svg, nav, footer, ad containers
    const noiseSelectors = [
      'script', 'style', 'noscript', 'iframe', 'svg',
      'nav', 'footer', '.ad', '.ads', '.advertisement', '#cookie-banner', '#cookie-consent'
    ];
    noiseSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });

    const title = document.title || target;
    const bodyText = document.body?.textContent || '';

    // Normalize text: collapse whitespace, trim lines
    const normalizedLines = bodyText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const normalizedContent = `PAGE TITLE: ${title}\nURL: ${target}\n\nCONTENT:\n${normalizedLines.join('\n')}`;
    const hash = this.computeHash(normalizedContent);

    return {
      rawContent: html.substring(0, 50000), // Cap raw stored HTML at 50KB to preserve DB storage
      normalizedContent,
      hash,
      metadata: {
        title,
        statusCode: response.status,
        lineCount: normalizedLines.length,
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

    const diff = computeTextDiff(oldNormalized, newResult.normalizedContent);

    return {
      hasChanged: diff.isSignificant,
      normalizedBefore: oldNormalized,
      normalizedAfter: newResult.normalizedContent,
      diffSummary: diff.formattedDiff,
      eventType: 'DOM_CONTENT_CHANGE',
    };
  }
}
