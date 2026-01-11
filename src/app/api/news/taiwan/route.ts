import Parser from "rss-parser";
import { LRUCache } from "lru-cache";

const parser = new Parser();

interface NewsItem {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string;
  summary?: string
}

const cache = new LRUCache<string, NewsItem[]>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

export async function GET() {
  const cacheKey = "taiwan-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return Response.json(cachedData);
  }

  try {
    // Google News RSS for Taiwan
    const feed = await parser.parseURL(
      "https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
    );

    const news: NewsItem[] = feed.items.map((item) => ({
      title: item?.title,
      link: item?.link,
      pubDate: item?.pubDate,
      source: "Google News",
      summary: item?.contentSnippet
    }));

    cache.set(cacheKey, news);
    return Response.json(news);
  } catch (error) {
    console.error("Error fetching Taiwan news:", error);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
