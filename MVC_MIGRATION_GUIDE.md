# 🎬 MovieApp MVC Migration Guide

## Overview

This guide helps you migrate your existing MovieApp from a basic structure to a clean MVC (Model-View-Controller) architecture.

## 🚀 Migration Steps

### Step 1: Install Additional Dependencies (if needed)

```bash
npm install axios @ant-design/icons
```

### Step 2: Move Existing Files

#### Current Structure → New Structure

```
OLD: src/api-config.js → NEW: src/services/api/config.js ✅ (Updated)
OLD: src/Layout/ → NEW: src/views/layouts/
OLD: src/pages/ → NEW: src/views/pages/
OLD: src/components/ → NEW: src/views/components/
```

### Step 3: Update Your Existing Components

#### Update Homepage.jsx to use MVC pattern:

```jsx
// OLD WAY (Direct API calls)
import { movieURL, options } from "../../api-config.js";

// NEW WAY (Using Controller)
import { useMovies } from "../../hooks/useMovies.js";
import MovieCard from "../../views/components/movie/MovieCard.jsx";

const Homepage = () => {
  const { movies, loading, error, getFeaturedMovies } = useMovies();

  useEffect(() => {
    getFeaturedMovies();
  }, [getFeaturedMovies]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="homepage">
      {movies.trending?.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
```

### Step 4: Create Missing Model Files

```javascript
// src/models/User.js
export class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    // ... other user properties
  }
}

// src/models/Genre.js
export class Genre {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }
}

// src/models/index.js
export { Movie } from "./Movie.js";
export { User } from "./User.js";
export { Genre } from "./Genre.js";
```

### Step 5: Update Your App.jsx

```jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./views/layouts/MainLayout/MainLayout.jsx";
import Homepage from "./views/pages/HomePage/Homepage.jsx";
import MovieDetailPage from "./views/pages/MovieDetailPage/MovieDetailPage.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          {/* Add more routes */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
```

## 🏗️ Benefits of MVC Structure

### 1. **Separation of Concerns**

- **Models**: Handle data structure and business logic
- **Views**: Handle UI components and presentation
- **Controllers**: Handle business logic and data flow

### 2. **Reusability**

- Components can be reused across different pages
- Business logic is centralized in controllers
- API calls are abstracted in services

### 3. **Maintainability**

- Easy to find and fix bugs
- Clear file organization
- Easier to add new features

### 4. **Testability**

- Each layer can be tested independently
- Mock services for testing controllers
- Mock controllers for testing views

## 📁 Final Directory Structure

```
src/
├── models/              # Data models and business entities
│   ├── Movie.js         ✅ Created
│   ├── User.js          📝 To create
│   ├── Genre.js         📝 To create
│   └── index.js         📝 To create
│
├── controllers/         # Business logic controllers
│   ├── MovieController.js    ✅ Created
│   ├── UserController.js     📝 To create
│   ├── SearchController.js   📝 To create
│   └── index.js              📝 To create
│
├── views/               # UI Components and pages
│   ├── components/
│   │   ├── movie/
│   │   │   ├── MovieCard.jsx     ✅ Created
│   │   │   ├── MovieGrid.jsx     📝 To create
│   │   │   └── MovieCarousel.jsx 📝 To create
│   │   ├── common/
│   │   │   ├── Button/           📝 To create
│   │   │   ├── Loading/          📝 To create
│   │   │   └── Modal/            📝 To create
│   │   └── layout/
│   │       ├── Header/           📝 Move from Layout/
│   │       ├── Footer/           📝 Move from Layout/
│   │       └── Navigation/       📝 To create
│   │
│   ├── pages/
│   │   ├── HomePage/             📝 Move from pages/Home/
│   │   ├── MovieDetailPage/      📝 To create
│   │   ├── SearchPage/           📝 To create
│   │   └── LoginPage/            📝 Move from pages/Login/
│   │
│   └── layouts/
│       ├── MainLayout/           📝 Move from Layout/
│       └── AuthLayout/           📝 To create
│
├── services/            # Data services and API calls
│   ├── api/
│   │   ├── movieAPI.js      ✅ Created
│   │   ├── userAPI.js       📝 To create
│   │   └── config.js        ✅ Created
│   ├── cache.js             ✅ Created
│   └── localStorage.js      📝 To create
│
├── hooks/               # Custom React hooks
│   ├── useMovies.js         ✅ Created
│   ├── useAuth.js           📝 To create
│   └── useLocalStorage.js   📝 To create
│
├── utils/               # Utility functions
│   ├── constants.js         📝 To create
│   ├── helpers.js           📝 To create
│   └── formatters.js        📝 To create
│
└── styles/              # CSS and styling
    ├── components/          📝 To create
    ├── pages/               📝 To create
    └── globals.css          📝 To create
```

## 🔄 Next Steps

1. **Move existing files** to new structure
2. **Update imports** in all components
3. **Create missing components** as needed
4. **Test the application** thoroughly
5. **Add error boundaries** for better error handling
6. **Implement loading states** consistently
7. **Add TypeScript** for better type safety (optional)

## 🎯 Quick Start Command

After setting up the structure, update your existing Homepage component to use the new MVC pattern:

```bash
# Move your existing files
mv src/Layout/* src/views/layouts/
mv src/pages/* src/views/pages/
mv src/components/* src/views/components/
```

This MVC structure will make your MovieApp much more maintainable and scalable! 🚀
