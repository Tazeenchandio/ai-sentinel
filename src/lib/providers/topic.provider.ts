import { BaseWatchProvider } from './base.provider';
import { FetchResult, CompareResult, WatchType } from '@/types';
import { computeTextDiff } from '../utils/diff';

export class TopicProvider extends BaseWatchProvider {
  type: WatchType = 'TOPIC_WATCH';

  async fetchLatest(target: string, lastMetadata?: Record<string, any>): Promise<FetchResult> {
    const topicKeywords = target.trim();
    const encodedTopic = encodeURIComponent(topicKeywords);

    // Search GitHub repos related to topic
    let githubRepos: any[] = [];
    try {
      const ghRes = await fetch(
        `https://api.github.com/search/repositories?q=${encodedTopic}&sort=updated&order=desc&per_page=5`,
        { headers: { 'User-Agent': 'AISentinel-App' } }
      );
      if (ghRes.ok) {
        const data = await ghRes.json();
        githubRepos = data.items || [];
      }
    } catch (e) {}

    const normalizedLines: string[] = [];
    normalizedLines.push(`TOPIC QUERY: "${topicKeywords}"`);
    normalizedLines.push(`SEARCH TIMESTAMP: ${new Date().toISOString()}\n`);

    normalizedLines.push(`RECENT MATCHING REPOSITORIES / PROJECTS:`);
    githubRepos.forEach((repo: any) => {
      normalizedLines.push(
        `- [${repo.full_name}] (${repo.stargazers_count}★) ${repo.description || 'No description'} (Updated: ${repo.updated_at})`
      );
    });

    const normalizedContent = normalizedLines.join('\n');
    const hash = this.computeHash(normalizedContent);

    return {
      rawContent: JSON.stringify({ topicKeywords, githubRepos }, null, 2),
      normalizedContent,
      hash,
      metadata: {
        topicKeywords,
        latestRepoFullName: githubRepos[0]?.full_name || null,
        updatedAts: githubRepos.map((r) => r.updated_at),
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
      eventType: 'TOPIC_DISCOVERY',
    };
  }
}
