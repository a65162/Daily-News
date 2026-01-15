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

  if (!results.length) throw new Error("cannot get juejin data.");

  const items: NewsItem[] = results.map((item) => ({
    title: item.article_info.title,
    link: `https://juejin.cn/post/${item.article_id}`,
    source: "掘金",
    summary: item.article_info.brief_content,
    date: new Date(parseInt(item.article_info.ctime) * 1000).toLocaleDateString("zh-TW"),
  }));

  return items;
}

export async function GET() {
  const cacheKey = "juejin-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return Response.json(cachedData);
  }

  try {
    const news = await fetchJuejin();
    cache.set(cacheKey, news);
    return Response.json(news);
  } catch (error) {
    console.error("Error fetching Juejin news:", error);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
