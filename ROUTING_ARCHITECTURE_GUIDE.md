# Modern React Routing Architecture Guide

## 📍 Routes Placement Strategy

### **Primary Location: `src/app/routes/`**

Routes should be placed in the app layer because they:

- Define application-wide navigation structure
- Handle global routing logic (authentication, redirects)
- Manage route guards and middleware
- Configure lazy loading for features

### **Secondary Location: `src/features/[feature]/routes/`**

Feature-level routes for:

- Complex feature sub-routing
- Feature-specific route guards
- Nested routing within features

## 🏗️ Recommended Structure

```
src/
├── app/
│   ├── routes/
│   │   ├── index.js                 # Main router export
│   │   ├── AppRouter.jsx           # Root router component
│   │   ├── ProtectedRoute.jsx      # Auth route wrapper
│   │   ├── PublicRoute.jsx         # Public route wrapper
│   │   ├── routes.config.js        # Route definitions
│   │   └── navigation.config.js    # Nav menu config
│   ├── providers/
│   ├── store/
│   └── config/
├── features/
│   ├── movies/
│   │   ├── routes/                 # Feature sub-routes (optional)
│   │   │   ├── index.js
│   │   │   └── MovieRoutes.jsx
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   └── auth/
└── shared/
    ├── components/
    ├── hooks/
    └── services/
```

## 📋 Implementation Examples

### 1. App-Level Router (`src/app/routes/AppRouter.jsx`)

```jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/shared/components/layout";
import { LoadingSpinner } from "@/shared/components/ui";
import { ProtectedRoute, PublicRoute } from "./index";

// Lazy load feature pages
const HomePage = React.lazy(() => import("@/features/Homepage/pages/HomePage"));
const MoviesPage = React.lazy(() => import("@/features/movies/pages/MoviesPage"));
const MovieDetailsPage = React.lazy(() => import("@/features/movies/pages/MovieDetailsPage"));
const AuthPage = React.lazy(() => import("@/features/auth/pages/AuthPage"));
const ProfilePage = React.lazy(() => import("@/features/profile/pages/ProfilePage"));

const AppRouter = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/auth/*"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/movies"
              element={
                <ProtectedRoute>
                  <MoviesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies/:id"
              element={
                <ProtectedRoute>
                  <MovieDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRouter;
```

### 2. Route Configuration (`src/app/routes/routes.config.js`)

```javascript
// Route definitions for easy management
export const ROUTES = {
  HOME: "/",
  AUTH: {
    BASE: "/auth",
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password"
  },
  MOVIES: {
    BASE: "/movies",
    DETAILS: "/movies/:id",
    SEARCH: "/movies/search",
    FAVORITES: "/movies/favorites"
  },
  PROFILE: {
    BASE: "/profile",
    SETTINGS: "/profile/settings",
    WATCHLIST: "/profile/watchlist"
  }
};

// Route metadata for navigation
export const ROUTE_CONFIG = [
  {
    path: ROUTES.HOME,
    name: "Home",
    component: "HomePage",
    isPublic: true,
    showInNav: true,
    icon: "home"
  },
  {
    path: ROUTES.MOVIES.BASE,
    name: "Movies",
    component: "MoviesPage",
    isPublic: false,
    showInNav: true,
    icon: "film"
  },
  {
    path: ROUTES.PROFILE.BASE,
    name: "Profile",
    component: "ProfilePage",
    isPublic: false,
    showInNav: true,
    icon: "user"
  }
];
```

### 3. Protected Route Component (`src/app/routes/ProtectedRoute.jsx`)

```jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoadingSpinner } from "@/shared/components/ui";
import { ROUTES } from "./routes.config";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### 4. Public Route Component (`src/app/routes/PublicRoute.jsx`)

```jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "./routes.config";

const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user && redirectIfAuthenticated) {
    // Redirect authenticated users away from auth pages
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default PublicRoute;
```

### 5. Navigation Configuration (`src/app/routes/navigation.config.js`)

```javascript
import { ROUTES, ROUTE_CONFIG } from "./routes.config";

// Main navigation items
export const MAIN_NAVIGATION = ROUTE_CONFIG.filter((route) => route.showInNav);

// User menu items
export const USER_NAVIGATION = [
  {
    path: ROUTES.PROFILE.BASE,
    name: "Profile",
    icon: "user"
  },
  {
    path: ROUTES.PROFILE.SETTINGS,
    name: "Settings",
    icon: "settings"
  },
  {
    path: ROUTES.PROFILE.WATCHLIST,
    name: "Watchlist",
    icon: "bookmark"
  }
];

// Footer navigation
export const FOOTER_NAVIGATION = [
  {
    path: "/about",
    name: "About"
  },
  {
    path: "/contact",
    name: "Contact"
  },
  {
    path: "/privacy",
    name: "Privacy"
  }
];
```

### 6. Feature-Level Routes (Optional - `src/features/auth/routes/AuthRoutes.jsx`)

```jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "../pages";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  );
};

export default AuthRoutes;
```

### 7. Main Routes Export (`src/app/routes/index.js`)

```javascript
// Clean exports for the routes module
export { default as AppRouter } from "./AppRouter";
export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as PublicRoute } from "./PublicRoute";
export { ROUTES, ROUTE_CONFIG } from "./routes.config";
export { MAIN_NAVIGATION, USER_NAVIGATION } from "./navigation.config";
```

## 🎯 Best Practices

### 1. **Route Organization**

- Keep app-level routes in `src/app/routes/`
- Use feature routes only for complex sub-routing
- Implement lazy loading for better performance

### 2. **Route Guards**

- Create reusable ProtectedRoute and PublicRoute components
- Handle loading states during authentication checks
- Redirect with preserved state for better UX

### 3. **Configuration-Driven**

- Use route configuration objects for maintainability
- Generate navigation menus from route config
- Centralize route paths to avoid hardcoding

### 4. **Performance Optimization**

- Implement code splitting with React.lazy()
- Use Suspense boundaries for loading states
- Preload critical routes

### 5. **Type Safety (TypeScript)**

```typescript
// src/app/routes/types.ts
export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  isPublic: boolean;
  showInNav: boolean;
  icon?: string;
  roles?: string[];
}
```

## 🚫 Anti-Patterns to Avoid

1. **Don't** put routes in `src/shared/` - they're app-specific
2. **Don't** hardcode route paths throughout the app
3. **Don't** put all routes in feature folders - use app-level for main navigation
4. **Don't** forget to implement proper error boundaries for route components

## ✅ Your Current Placement is Correct!

Your current structure with `src/app/routes/` is following modern React architecture best practices. Keep the routes in the app layer for global routing logic and navigation structure.
