import { BaseWatchProvider } from './base.provider';
import { GitHubProvider } from './github.provider';
import { WebsiteProvider } from './website.provider';
import { RSSProvider } from './rss.provider';
import { TopicProvider } from './topic.provider';
import { WatchType } from '@/types';

export class WatchProviderRegistry {
  private static providers: Record<WatchType, BaseWatchProvider> = {
    GITHUB_REPO: new GitHubProvider(),
    WEBSITE: new WebsiteProvider(),
    RSS_FEED: new RSSProvider(),
    TOPIC_WATCH: new TopicProvider(),
  };

  static getProvider(type: WatchType): BaseWatchProvider {
    const provider = this.providers[type];
    if (!provider) {
      throw new Error(`Unsupported watch provider type: "${type}".`);
    }
    return provider;
  }
}
