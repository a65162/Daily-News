# Product Requirements Document (PRD): Daily News Aggregator

## 1. 專案概述 (Project Overview)

開發一個個人的每日新聞聚合 Web App，旨在減少使用者在不同新聞來源間切換的時間。系統將自動抓取並整合台灣新聞、國際新聞、動漫資訊及科技新聞，提供一站式的閱讀體驗。

## 2. 目標 (Goals)

- **效率**：快速瀏覽多個來源的最新標題。
- **簡潔**：無干擾的閱讀介面。
- **即時**：獲取當下最新的資訊。

## 3. 功能需求 (Functional Requirements)

### 3.1 新聞聚合 (News Aggregation)

系統需支援以下類別新聞來源的抓取與顯示：

#### A. 台灣新聞 (Taiwan News)

- **來源**：Google News RSS（台灣版）。
- **顯示欄位**：標題、發布時間、來源媒體、原始連結、摘要（contentSnippet）。

#### B. 國際新聞 (International News)

- **來源**：Google News RSS（World，英文版）。
- **顯示欄位**：標題、發布時間、來源媒體、原始連結、摘要（contentSnippet）。

#### C. 動漫資訊 (Animation Info)

- **來源**：巴哈姆特哈啦板（動漫綜合版）`https://forum.gamer.com.tw/B.php?bsn=60037`
- **抓取邏輯**：
  - 解析 HTML，提取列表中的文章標題、作者、時間與簡述。
  - 過濾置頂公告（b-list\_\_row--sticky）。
- **顯示欄位**：標題、作者、發布時間、摘要、連結。

#### D. 科技新聞 (Technology News)

- **來源**：
  1. **iThome**：`https://www.ithome.com.tw`（最新新聞列表）
  2. **4Gamers**：`https://www.4gamers.com.tw`（API 最新消息）
  3. **掘金 (Juejin)**：`https://api.juejin.cn`（推薦文章 API）
- **顯示欄位**：標題、摘要（若有）、來源網站、發布日期、連結。
- **備註**：目前 API 端點為三個來源分開提供（iThome、4Gamers、掘金）。

### 3.2 使用者介面 (User Interface)

- **儀表板 (Dashboard)**：首頁以 Tab 呈現 6 個分頁：台灣、國際、動漫、科技（iThome）、4Gamers、掘金。
- **外部連結**：點擊新聞標題時，以新分頁開啟原始網頁。
- **手動更新**：提供「重新整理」按鈕，強制重新抓取最新資料。
- **狀態提示**：切換或刷新時顯示載入狀態。

### 3.3 AI 輔助功能 (AI Features - Reserved for V2)

- **一鍵摘要 (On-demand Summarization)**：
  - 在新聞卡片上提供「摘要」按鈕。
  - 點擊後呼叫 LLM API (如 OpenAI/Gemini) 針對該新聞內文進行 3 點摘要。
- **多語言翻譯 (Translation)**：
  - 針對非中文內容提供自動翻譯選項。

## 4. 非功能需求 (Non-Functional Requirements)

- **效能**：頁面載入速度應在 2 秒內（使用快取機制）。
- **響應式**：支援 Desktop 與 Mobile 瀏覽。
- **資料新鮮度**：預設快取時間為 10 分鐘，避免過度頻繁請求來源網站。

## 5. 技術架構 (Technical Architecture)

### 5.1 Tech Stack

- **Frontend**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Backend / API**: Next.js API Routes
- **Data Fetching**:
  - `rss-parser`: 處理 RSS 來源。
  - `cheerio`: 處理 HTML 爬蟲。
  - `axios` / `fetch`: 發送 HTTP 請求。
- **Cache**: In-memory LRU Cache (TTL 10 分鐘)

### 5.2 API Design

- `GET /api/news/taiwan`：台灣新聞（RSS）。
- `GET /api/news/world`：國際新聞（RSS）。
- `GET /api/news/acg`：巴哈姆特爬蟲結果。
- `GET /api/news/tech`：iThome 最新新聞。
- `GET /api/news/4gamers`：4Gamers 最新消息。
- `GET /api/news/juejin`：掘金推薦文章。
