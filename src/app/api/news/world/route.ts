import Parser from "rss-parser";
import { LRUCache } from "lru-cache";

const parser = new Parser();

interface NewsItem {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string;
}

const cache = new LRUCache<string, NewsItem[]>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

export async function GET() {
  const cacheKey = "world-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return Response.json(cachedData);
  }

  try {
    // Updated Google News RSS for World (International)
    // Using the generic section URL which redirects to the current valid topic ID
    const worldFeed = await parser.parseURL(
      "https://news.google.com/rss/headlines/section/topic/WORLD?hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
    );

    const news: NewsItem[] = worldFeed.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: (item as { source?: { "#text"?: string } }).source?.["#text"] || "Google News",
    }));

    cache.set(cacheKey, news);
    return Response.json(news);
  } catch (error) {
    console.error("Error fetching World news:", error);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
