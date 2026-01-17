import axios from "axios";
import * as cheerio from "cheerio";
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

async function fetchIThome() {
  const { data } = await axios.get("https://www.ithome.com.tw", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = cheerio.load(data);
  const items: NewsItem[] = [];
  $(".view-latest-news > .view-content > .item").each((_, el) => {
    const title = $(el).find(".title a").text().trim();
    const link = "https://www.ithome.com.tw" + $(el).find(".title a").attr("href");
    const summary = $(el).find(".summary").text().trim();
    const date = $(el).find(".post-at").text().trim();

    if (!title || !link) return;

    items.push({ title, link, source: "iThome", summary, date });
  });

  if (!items.length) throw new Error("cannot get IThome data.");

  return items;
}

export async function GET() {
  const cacheKey = "ithome-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return Response.json(cachedData);
  }

  try {
    const news = await fetchIThome();
    cache.set(cacheKey, news);
    return Response.json(news);
  } catch (error) {
    console.error("Error fetching iThome news:", error);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
