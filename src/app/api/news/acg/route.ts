import axios from "axios";
import * as cheerio from "cheerio";
import { LRUCache } from "lru-cache";

interface ACGNewsItem {
  title: string;
  link: string;
  author: string;
  date: string;
}

const cache = new LRUCache<string, ACGNewsItem[]>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

export async function GET() {
  const cacheKey = "acg-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return Response.json(cachedData);
  }

  try {
    const url = "https://forum.gamer.com.tw/B.php?bsn=60037";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.31",
      },
    });

    const $ = cheerio.load(data);
    const news: ACGNewsItem[] = [];

    $(".b-list__main").each((_, element) => {
      const $el = $(element);
      
      // Skip sticky posts (usually have b-list__sticky class or similar)
      if ($el.closest(".b-list__row").hasClass("b-list__row--sticky")) {
        return;
      }

      const title = $el.find(".b-list__main__title").text().trim();
      const link = "https://forum.gamer.com.tw/" + $el.find(".b-list__main__title").attr("href");
      const author = $el.find(".b-list__count__user a").text().trim();
      const date = $el.find(".b-list__time").text().trim();

      if (title && link) {
        news.push({ title, link, author, date });
      }
    });

    cache.set(cacheKey, news);
    return Response.json(news);
  } catch (error) {
    console.error("Error fetching ACG news:", error);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
