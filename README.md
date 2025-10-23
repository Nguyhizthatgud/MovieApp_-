# MovieApp - 时间如水

A modern, feature-rich React movie application demonstrating **AI-powered hybrid search** with dual-layer search strategy (TMDB API + Gemini LLM).  
Designed for portfolio presentation and educational purposes — showcases how to integrate Large Language Models (LLMs) with traditional APIs to create intelligent, responsive search experiences.

---

## AI & LLM Integration - Key Differentiator

This application demonstrates a **smart, production-ready approach to AI search**:

### Hybrid Search Strategy

- **Layer 1 (Primary)**: TMDB API for fast, curated movie data
- **Layer 2 (Fallback)**: Gemini 2.5 Flash LLM for creative/niche searches
- **Result**: Zero failed searches - always deliver results to users

### Intelligent Search Flow

```
User Search Query
    ↓
Search TMDB Database (Fast)
    ├─ Found? → Return results immediately
    └─ Not found? → Activate Gemini AI
         ↓
    Gemini LLM generates movie information
    (creative titles, descriptions, metadata)
    ↓
Return AI-enhanced results
```

### Smart Caching System

- **Cache Strategy**: Results are cached by query string
- **Performance**: Repeated searches return instantly (no API calls)
- **Cost Optimization**: Reduces API calls and LLM token usage
- **User Experience**: Seamless, instant results on re-search

### Data Enrichment via LLM

Gemini LLM provides enhanced movie data including:

- Movie IDs, titles, and overviews
- Release dates, runtime, ratings
- Budget, revenue, languages
- Production companies and countries
- Genre classification and popularity metrics
- Trailer sources for multimedia integration

---

## Key Points

- **Architecture**: MVC + Feature-Based organization with AI service integration
- **AI/LLM**: Gemini 2.5 Flash for intelligent fallback search and data generation
- **Search**: Dual-layer (TMDB + Gemini) with smart caching
- **Focus**: Maintainability, scalability, testability, intelligent data retrieval
- **Security**: Environment variable management, API key protection
- **Purpose**: Portfolio / education — clean code, AI integration patterns, real-world search strategies
- **Primary Tech**: React, Vite, Ant Design, Tailwind CSS, Axios, Google Gemini API

---

## Features

- **Smart Movie Search** (TMDB + Gemini LLM)
  - Primary search via TMDB Database (instant results)
  - Fallback to Gemini AI for creative/niche searches
  - Real-time loading state indicators showing which service is active
- **AI-Powered Data Enrichment**
  - Gemini generates comprehensive movie information
  - Enhanced metadata including budget, revenue, production details
  - Automatic parsing and structured data extraction
- **Intelligent Caching**
  - Query-based caching for Gemini responses
  - Instant results for repeated searches
  - Reduced API costs and improved response times
- **Browse and Search Movies** (dual-source)
- **View Movie Details**, cast, and videos
- **Add / Remove Favorites** using TMDB account endpoints
- **Favorites Page** with pagination and remove action
- **Authentication-Ready** structure (hooks and guards)
- **Responsive UI** with Ant Design + Tailwind utilities
- **Custom Hooks** and service layer for testable business logic

---

## Tech Stack 🛠

### Core Technologies

- **LLM & AI**: Google Gemini 2.5 Flash (intelligent search & data generation)
- **React 18**: Latest React with concurrent features
- **JavaScript ES6+**: Modern JavaScript features
- **Vite**: Next-generation build tool for fast development
- **React Router DOM**: Client-side routing

### API & Data

- **TMDB API**: Primary movie database (curated, fast)
- **Gemini API**: Secondary intelligent search & data enrichment
- **Axios**: HTTP client for API communication

### UI & Styling

- **Ant Design**: Component library
- **Tailwind CSS**: Utility-first CSS framework

---

## Architecture Overview

This repository emphasizes **maintainability**, **scalability**, and **intelligent AI integration** by combining:

### Code Organization

- **MVC Pattern**
  - Model: `src/shared/api/*`, services handling API requests and data transformations
  - View: `src/features/*/views/*` — pure UI components and layouts
  - Controller: `src/features/*/controllers/*` — hooks containing business logic and state
- **Feature-Based Layout** (code grouped by feature/domain)
  - Each feature folder contains its own `views/`, `controllers/`, `models/`
- **Global Shared Layer**: `src/shared/` (api, components, services, utils)
- **App-Level Resources**: `src/app/` (providers, hooks, context)

### AI Integration Architecture

- **useSearchMovie Hook** (`src/app/hooks/useSearchMovie.jsx`)
  - Manages dual-layer search (TMDB → Gemini fallback)
  - Handles response caching and state management
  - Provides loading state tracking for UI feedback
- **Smart Search Flow**
  - TMDB search with 300ms debounce
  - Automatic Gemini activation on zero TMDB results
  - Intelligent response parsing (handles multiple JSON formats)
  - Query-based result caching

Benefits: clearer ownership, easier onboarding, isolated testing, parallel team work, production-ready AI patterns.

---

## Project Structure (excerpt)

```
src/
├─ app/
│  └─ hooks/
│     └─ useSearchMovie.jsx  # 🤖 Dual-layer search with LLM integration & caching
├─ features/
│  ├─ Detailpage/
│  │  ├─ controllers/
│  │  └─ views/
│  └─ Favoritemoviepage/
│     ├─ controllers/
│     └─ views/
├─ shared/
│  ├─ api/                  # API config & endpoints (TMDB + Gemini)
│  ├─ components/           # SearchDropdownItem shows AI search state
│  └─ services/
└─ main.jsx
```

---

## Getting Started

1. Clone repository

   ```bash
   git clone <your-repo-url>
   cd MovieApp
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create `.env` in project root and add credentials:

   ```
   VITE_API_KEY=your_tmdb_api_key
   VITE_ACCESS_TOKEN=your_tmdb_access_token
   VITE_ACCOUNT_ID=your_tmdb_account_id
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. Run development server

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173

---

## How to Use (developer tips)

- Controllers (hooks) expose functions and state; Views should only call those hooks and render UI.
- Keep API details in `shared/api/config.js` and use centralized endpoints for both TMDB and Gemini.
- Use `notification.useNotification()` in view components for user feedback.
- Understand the dual-layer search: TMDB is fast and curated, Gemini is creative and comprehensive.
- Monitor the `searchingService` state to show users which search backend is active.
- Leverage caching to reduce API calls and improve perceived performance.

---

## AI Search Highlights

### How Gemini Enhances Search

```javascript
// Automatic fallback pattern:
1. User searches "obscure indie movie"
2. TMDB returns 0 results
3. Gemini LLM generates realistic movie data
4. Results displayed with full metadata
5. Cached for instant re-access
```

### Response Caching Example

```javascript
// First search: "Inception"
// - TMDB search (300ms debounce)
// - Found! Returns immediately
// - Cached automatically

// Second search: "Inception"
// - Cache HIT ✅
// - Results returned instantly (no API call)
```

### Loading State Feedback

- Shows "Searching for '{query}'..." during TMDB search
- Shows "Searching for '{query}' with Gemini..." when LLM is engaged
- Users see continuous feedback during entire process

---

## Styling & Fonts

- Ant Design used for core components.
- Tailwind CSS used for layout and utilities.
- Fontshare fonts can be added in `index.html` or imported in global CSS:
  ```html
  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap" rel="stylesheet" />
  ```
- Apply fonts in components via className or inline style for titles.

---

## Testing

- Unit-test controllers (hooks) and small view components.
- Use React Testing Library + Jest for component and hook tests.
- Mock API calls with msw or jest mocks for deterministic tests.
- Test dual-layer search logic separately (TMDB success path vs Gemini fallback).

---

## Deployment

- Build for production
  ```bash
  npm run build
  npm run preview
  ```
- Deploy the `dist/` output to any static hosting (Netlify, Vercel, GitHub Pages).
- Ensure Gemini API key is available in production environment.

---

## Contributing

- Follow feature-based conventions: add new feature under `src/features/<FeatureName>/` with `controllers/` and `views/`.
- Keep controllers pure from UI markup; return plain JS objects and callbacks.
- When adding new search features, maintain the dual-layer pattern (primary + fallback).
- Run linter/formatter before PR.

---

## License & Contact

- License: MIT
- Author / Portfolio: Nguyhizthatgud - https://github.com/Nguyhizthatgud
