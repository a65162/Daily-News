# Daily News Aggregator

A personal daily news aggregator web app that brings together Taiwan, international, animation, and tech news in one clean, fast, and up-to-date reading experience. Built with **Next.js (App Router)**, it fetches data through **API Routes**, caches responses, and uses **Tailwind CSS** for a responsive interface—great for portfolio showcase.

## Highlights

- **Six tabs dashboard**: Taiwan, World, ACG, Tech (iThome), 4Gamers, Juejin.
- **Manual refresh**: One-click refresh to fetch the latest data.
- **Caching**: Default 10-minute in-memory LRU cache for speed and freshness.
- **Minimal UI**: Distraction-free reading experience for quick daily browsing.

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Backend / API**: Next.js API Routes
- **Data Fetching**: rss-parser / cheerio / fetch
- **Cache**: In-memory LRU cache (TTL 10 minutes)

## Data Sources

| Category        | Source                   | Content                            | Method        |
| --------------- | ------------------------ | ---------------------------------- | ------------- |
| Taiwan News     | Google News RSS (Taiwan) | Title, time, source, link, snippet | RSS parsing   |
| World News      | Google News RSS (World)  | Title, time, source, link, snippet | RSS parsing   |
| Animation (ACG) | Bahamut forum board      | Title, author, time, snippet, link | HTML scraping |
| Tech (iThome)   | iThome latest news       | Title, snippet, source, date, link | HTML scraping |
| Tech (4Gamers)  | 4Gamers latest news API  | Title, snippet, source, date, link | API fetch     |
| Tech (Juejin)   | Juejin recommended API   | Title, snippet, source, date, link | API fetch     |

## Core Features

- **Dashboard**: Six tabs for each news category/source.
- **External links**: Open original articles in a new tab.
- **Manual refresh**: Force-fetch the latest data.
- **Loading state**: Visible status during tab changes and refresh.

## API Endpoints

- `GET /api/news/taiwan`: Taiwan news (RSS)
- `GET /api/news/world`: World news (RSS)
- `GET /api/news/acg`: ACG news (Bahamut)
- `GET /api/news/tech`: iThome tech news
- `GET /api/news/4gamers`: 4Gamers latest news
- `GET /api/news/juejin`: Juejin recommended articles

## Local Development

```bash
pnpm install
pnpm dev
```

Open the browser at:

```
http://localhost:3000
```

## Roadmap (V2)

- **On-demand summarization**: 3-point summary for each article.
- **Translation**: Auto-translate non-Chinese content.
