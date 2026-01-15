"use client";

import { useState, useEffect, useRef } from "react";

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
  const latestTimestamp = useRef<number | null>(null)
  const tabs = [
    { id: "taiwan", name: "Taiwan News" },
    { id: "world", name: "World News" },
    { id: "acg", name: "Anime News" },
    { id: "tech", name: "Tech News" },
    { id: "4gamers", name: "4Gamers" },
    { id: "juejin", name: "Juejin" },
  ];


  const fetchNews = async (tabId: string) => {
    const now = new Date().valueOf()
    latestTimestamp.current = now
    setLoading(true);


    try {
      const res = await fetch(`/api/news/${tabId}`);
      const data = await res.json();

      if (latestTimestamp.current !== now) return
      if (Array.isArray(data)) {
        setNews(data);
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews([]);
    } finally {
      setLoading(latestTimestamp.current !== now)
    }
  }

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily News Aggregator</h1>
          <p className="text-gray-600">Get all the information you care about in one place</p>
        </header>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
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
            title="Refresh"
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
              <p className="mt-2 text-gray-500">Fetching the latest news...</p>
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
                    {item.author && <span>Author: {item.author}</span>}
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
              <p className="text-gray-500">No news available at the moment</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
