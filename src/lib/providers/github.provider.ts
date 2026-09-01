import { BaseWatchProvider } from './base.provider';
import { FetchResult, CompareResult, WatchType } from '@/types';
import { computeTextDiff } from '../utils/diff';

export class GitHubProvider extends BaseWatchProvider {
  type: WatchType = 'GITHUB_REPO';

  private parseRepo(target: string): { owner: string; repo: string } {
    let cleaned = target.trim();
    if (cleaned.startsWith('https://github.com/')) {
      cleaned = cleaned.replace('https://github.com/', '');
    }
    cleaned = cleaned.replace(/\/$/, '').replace(/\.git$/, '');
    const parts = cleaned.split('/');
    if (parts.length < 2) {
      throw new Error(`Invalid GitHub repository target format: "${target}". Expected "owner/repo" or "https://github.com/owner/repo".`);
    }
    return { owner: parts[0], repo: parts[1] };
  }

  private async fetchWithTimeout(url: string, headers: Record<string, string>, timeoutMs = 8000): Promise<Response | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      return null;
    }
  }

  async fetchLatest(target: string, lastMetadata?: Record<string, any>): Promise<FetchResult> {
    const { owner, repo } = this.parseRepo(target);
    const headers: Record<string, string> = {
      'User-Agent': 'AISentinel-App',
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_PAT) {
      headers.Authorization = `token ${process.env.GITHUB_PAT}`;
    }

    // 1. Fetch latest release with timeout
    let latestRelease: any = null;
    const releaseRes = await this.fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, headers);
    if (releaseRes && releaseRes.ok) {
      latestRelease = await releaseRes.json().catch(() => null);
    }

    // 2. Fetch latest commits (last 5) with timeout
    let commits: any[] = [];
    const commitsRes = await this.fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, headers);
    if (commitsRes && commitsRes.ok) {
      commits = await commitsRes.json().catch(() => []);
    }

    // 3. Fetch repo general info with timeout
    let repoInfo: any = {};
    const infoRes = await this.fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}`, headers);
    if (infoRes && infoRes.ok) {
      repoInfo = await infoRes.json().catch(() => ({}));
    }

    const normalizedLines: string[] = [];

    normalizedLines.push(`REPOSITORY: ${owner}/${repo}`);
    if (repoInfo.description) {
      normalizedLines.push(`DESCRIPTION: ${repoInfo.description}`);
    }
    normalizedLines.push(`STARS: ${repoInfo.stargazers_count || 0} | FORKS: ${repoInfo.forks_count || 0}`);

    if (latestRelease) {
      normalizedLines.push(`LATEST RELEASE: ${latestRelease.tag_name} (${latestRelease.name || 'Untitled'})`);
      normalizedLines.push(`PUBLISHED AT: ${latestRelease.published_at}`);
      normalizedLines.push(`RELEASE NOTES:\n${latestRelease.body || 'No release notes.'}`);
    } else {
      normalizedLines.push(`LATEST RELEASE: None`);
    }

    normalizedLines.push(`\nRECENT COMMITS:`);
    if (Array.isArray(commits) && commits.length > 0) {
      commits.forEach((c: any) => {
        const sha = c.sha?.substring(0, 7) || 'unknown';
        const msg = c.commit?.message?.split('\n')[0] || '';
        const author = c.commit?.author?.name || 'unknown';
        normalizedLines.push(`- [${sha}] ${msg} (by ${author})`);
      });
    } else {
      normalizedLines.push(`- [no-commits-found] (Repository pushed date: ${repoInfo.pushed_at || 'unknown'})`);
    }

    const rawContent = JSON.stringify({ repoInfo, latestRelease, commits }, null, 2);
    const normalizedContent = normalizedLines.join('\n');
    const hash = this.computeHash(normalizedContent);

    return {
      rawContent,
      normalizedContent,
      hash,
      metadata: {
        owner,
        repo,
        latestReleaseTag: latestRelease?.tag_name || null,
        latestCommitSha: Array.isArray(commits) && commits[0] ? commits[0].sha : null,
        pushedAt: repoInfo.pushed_at,
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

    let eventType = 'REPOSITORY_ACTIVITY';
    if (oldMetadata?.latestReleaseTag !== newResult.metadata?.latestReleaseTag) {
      eventType = 'NEW_RELEASE';
    } else if (oldMetadata?.latestCommitSha !== newResult.metadata?.latestCommitSha) {
      eventType = 'NEW_COMMITS';
    }

    return {
      hasChanged: diff.isSignificant,
      normalizedBefore: oldNormalized,
      normalizedAfter: newResult.normalizedContent,
      diffSummary: diff.formattedDiff,
      eventType,
    };
  }
}
