import axios from "axios";
import * as cheerio from "cheerio";
import { LRUCache } from "lru-cache";

interface TechNewsItem {
  title?: string;
  link?: string;
  source?: string;
  summary?: string;
  date?: string
}

const cache = new LRUCache<string, TechNewsItem[]>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

async function fetchIThome() {
  const { data } = await axios.get("https://www.ithome.com.tw", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = cheerio.load(data);
  const items: TechNewsItem[] = [];
  $(".view-latest-news .view-content .item").each((_, el) => {
    const title = $(el).find(".title a").text().trim();
    const link = "https://www.ithome.com.tw" + $(el).find(".title a").attr("href");
    const summary = $(el).find(".summary").text().trim();
    const date = $(el).find('.post-at').text().trim()

    if (!title || !link) return

    items.push({ title, link, source: "iThome", summary, date });
  });

  if (!items.length) throw new Error('cannot get IThome data.')

  return items
}

async function fetch4Gamers() {
  const { data } = await axios.get("https://www.4gamers.com.tw/site/api/news/latest?pageSize=10", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const results = (data?.data?.results || []) as {
    title: string,
    canonicalUrl: string,
    intro: string,
    createPublishedAt: number
  }[];

  if (!results.length) throw new Error('cannot get 4Gamers data.')

  const items: TechNewsItem[] = results.map((item) => ({
    title: item.title,
    link: item.canonicalUrl,
    source: "4Gamers",
    summary: item.intro,
    date: new Date(item.createPublishedAt).toLocaleDateString('zh-TW')
  }));

  return items;
}

async function fetchJuejin() {
  const { data } = await axios.post(
    "https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed",
    { limit: 20, client_type: 6587, cursor: "0", id_type: 2, cate_id: "6809637767543259144", sort_type: 300 },
    {
      headers: { "User-Agent": "Mozilla/5.0" },
    }
  );

  const results = (data?.data || []) as {
    article_id: string;
    article_info: {
      title: string;
      brief_content: string;
      ctime: string;
    };
  }[];

  if (!results.length) throw new Error('cannot get juejin data.')

  const items: TechNewsItem[] = results
    .map((item) => ({
      title: item.article_info.title,
      link: `https://juejin.cn/post/${item.article_id}`,
      source: "掘金",
      summary: item.article_info.brief_content,
      date: new Date(parseInt(item.article_info.ctime) * 1000).toLocaleDateString("zh-TW"),
    }));

  return items
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
