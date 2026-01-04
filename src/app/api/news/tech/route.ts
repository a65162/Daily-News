import axios from "axios";
import * as cheerio from "cheerio";
import { LRUCache } from "lru-cache";

interface TechNewsItem {
  title: string;
  link: string;
  source: string;
  summary?: string;
}

const cache = new LRUCache<string, TechNewsItem[]>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

async function fetchIThome() {
  try {
    const { data } = await axios.get("https://www.ithome.com.tw", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);
    const items: TechNewsItem[] = [];
    $(".view-content .item").each((_, el) => {
      const title = $(el).find(".title a").text().trim();
      const link = "https://www.ithome.com.tw" + $(el).find(".title a").attr("href");
      const summary = $(el).find(".summary").text().trim();
      if (title && link) {
        items.push({ title, link, source: "iThome", summary });
      }
    });
    return items.slice(0, 10);
  } catch (e) {
    console.error("iThome fetch error", e);
    return [];
  }
}

async function fetch4Gamers() {
  try {
    const { data } = await axios.get("https://www.4gamers.com.tw/news", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);
    const items: TechNewsItem[] = [];
    $(".news-card").each((_, el) => {
      const title = $(el).find(".title").text().trim();
      const link = $(el).find("a").attr("href") || "";
      if (title && link) {
        items.push({ title, link, source: "4Gamers" });
      }
    });
    return items.slice(0, 10);
  } catch (e) {
    console.error("4Gamers fetch error", e);
    return [];
  }
}

async function fetchJuejin() {
  try {
    // Juejin often uses API, but let's try a simple scrape of the extension page or similar
    // For simplicity in MVP, we'll try to scrape the main page if possible or a known list
    const { data } = await axios.get("https://juejin.cn/?sort=three_days_hotest", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);
    const items: TechNewsItem[] = [];
    $(".entry .title-row a").each((_, el) => {
      const title = $(el).text().trim();
      const link = "https://juejin.cn" + $(el).attr("href");
      if (title && link) {
        items.push({ title, link, source: "掘金" });
      }
    });
    return items.slice(0, 10);
  } catch (e) {
    console.error("Juejin fetch error", e);
    return [];
  }
}

export async function GET() {
  const cacheKey = "tech-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return Response.json(cachedData);
  }

  try {
    const [ithome, gamers, juejin] = await Promise.all([
      fetchIThome(),
      fetch4Gamers(),
      fetchJuejin(),
    ]);

    const allNews = [...ithome, ...gamers, ...juejin];
    cache.set(cacheKey, allNews);
    return Response.json(allNews);
  } catch (error) {
    console.error("Error fetching Tech news:", error);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
