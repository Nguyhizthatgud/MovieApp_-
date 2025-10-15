# MovieApp - 时间如水

A modern, feature-rich React movie application demonstrating MVC + Feature-Based architecture.  
Designed for portfolio presentation and educational purposes — shows how to structure, implement, and scale a real-world front-end application that integrates with The Movie Database (TMDB) API.

---

## Key Points

- Architecture: MVC (Model - View - Controller) combined with Feature-Based organization
- Focus: Maintainability, scalability, testability, separation of concerns
- Security: Environment variable management and Front-end security issues
- Purpose: Portfolio / education — clean code, clear separation of concerns, testable units
- Primary tech: React, Vite, Ant Design, Tailwind CSS, Axios, React Router

---

## Features

- Browse and search movies (TMDB)
- View movie details, cast, and videos
- Add / remove favorites using TMDB account endpoints
- Favorites page with pagination and remove action
- Authentication-ready structure (hooks and guards)
- Responsive UI with Ant Design + Tailwind utilities
- Custom hooks and service layer for testable business logic

---

## Tech Stack 🛠

Core Technologies
React 18: Latest React with concurrent features
JavaScript ES6+: Modern JavaScript features
Vite: Next-generation build tool for fast development
React Router DOM: Client-side routing

## Architecture Overview

This repository emphasizes maintainability and scalability by combining:

- MVC pattern
  - Model: `src/shared/api/*`, services handling API requests and data transformations
  - View: `src/features/*/views/*` — pure UI components and layouts
  - Controller: `src/features/*/controllers/*` — hooks containing business logic and state
- Feature-Based layout (code grouped by feature/domain rather than technical role)
  - Each feature folder contains its own `views/`, `controllers/`, (optional) `components/`
- Global shared layer: `src/shared/` (api, components, services, utils)
- App-level resources: `src/app/` (providers, general hooks, context)

Benefits: clearer ownership, easier onboarding, isolated testing, parallel team work.

---

## Project Structure (excerpt)

```
src/
├─ app/
│  └─ hooks/                # global hooks (useAuth, useSearchMovie, etc.)
├─ features/
│  ├─ Detailpage/
│  │  ├─ controllers/       # Controller layer (hooks with business logic)
│  │  └─ views/             # View layer (DetailPage.jsx)
│  └─ Favoritemoviepage/
│     ├─ controllers/       # favorites logic (useFavoriteMovies)
│     └─ views/             # Favoritepage.jsx, Favoritemoviecard.jsx
├─ shared/
│  ├─ api/                  # API config & endpoints (TMDB)
│  ├─ components/           # reusable UI components (HeaderLayout, Avatar, etc.)
│  └─ services/             # helper services (notification service, storage)
└─ main.jsx                 # app entry
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

3. Create `.env` in project root and add TMDB credentials:

   ```
   VITE_API_KEY=your_tmdb_api_key
   VITE_ACCESS_TOKEN=your_tmdb_access_token
   VITE_ACCOUNT_ID=your_tmdb_account_id
   ```

4. Run development server

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173

---

## How to Use (developer tips)

- Controllers (hooks) expose functions and state; Views should only call those hooks and render UI.
- Keep API details in `shared/api/config.js` and use centralized endpoints.
- Use `notification.useNotification()` in view components and pass messages from controllers via returned status or throw errors to be handled by the view.
- Avoid side-effects in view files — perform data fetching and mutations in controller hooks.

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

---

## Deployment

- Build for production
  ```bash
  npm run build
  npm run preview
  ```
- Deploy the `dist/` output to any static hosting (Netlify, Vercel, GitHub Pages).

---

---

## Contributing

- Follow feature-based conventions: add new feature under `src/features/<FeatureName>/` with `controllers/` and `views/`.
- Keep controllers pure from UI markup; return plain JS objects and callbacks.
- Run linter/formatter before PR.

---

## License & Contact

- License: MIT
- Author / Portfolio: Nguyhizthatgud - https://github.com/Nguyhizthatgud
