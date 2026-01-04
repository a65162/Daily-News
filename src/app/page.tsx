"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  link: string;
  source?: string;
  pubDate?: string;
  author?: string;
  summary?: string;
  date?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("taiwan");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "taiwan", name: "台灣新聞" },
    { id: "world", name: "國際新聞" },
    { id: "acg", name: "動漫資訊" },
    { id: "tech", name: "科技新聞" },
  ];

  const fetchNews = async (tabId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${tabId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNews(data);
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">每日新聞聚合</h1>
          <p className="text-gray-600">一站式獲取您感興趣的所有資訊</p>
        </header>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={() => fetchNews(activeTab)}
            className="ml-auto p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="重新整理"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-500">正在抓取最新新聞...</p>
            </div>
          ) : news.length > 0 ? (
            news.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {item.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {item.source && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {item.source}
                      </span>
                    )}
                    {item.author && <span>作者: {item.author}</span>}
                    {item.pubDate && <span>{new Date(item.pubDate).toLocaleString()}</span>}
                    {!item.pubDate && item.date && <span>{item.date}</span>}
                  </div>
                  {item.summary && (
                    <p className="mt-3 text-gray-600 line-clamp-2">{item.summary}</p>
                  )}
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">目前沒有新聞資料</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
