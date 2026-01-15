import axios from "axios";
import { LRUCache } from "lru-cache";

interface NewsItem {
  title?: string;
  link?: string;
  source?: string;
  summary?: string;
  date?: string;
}

const cache = new LRUCache<string, NewsItem[]>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

async function fetch4Gamers() {
  const { data } = await axios.get("https://www.4gamers.com.tw/site/api/news/latest?pageSize=10", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const results = (data?.data?.results || []) as {
    title: string;
    canonicalUrl: string;
    intro: string;
    createPublishedAt: number;
  }[];

  if (!results.length) throw new Error("cannot get 4Gamers data.");

  const items: NewsItem[] = results.map((item) => ({
    title: item.title,
    link: item.canonicalUrl,
    source: "4Gamers",
    summary: item.intro,
    date: new Date(item.createPublishedAt).toLocaleDateString("zh-TW"),
  }));

  return items;
}

export async function GET() {
  const cacheKey = "4gamers-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return Response.json(cachedData);
  }

  try {
    const news = await fetch4Gamers();
    cache.set(cacheKey, news);
    return Response.json(news);
  } catch (error) {
    console.error("Error fetching 4Gamers news:", error);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
