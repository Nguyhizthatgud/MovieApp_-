# App-Level Layouts: Structural Foundation Components

## 🏗️ **What Are App-Level Layouts?**

App-level layouts are **structural foundation components** that:

- 🏛️ **Define overall page structure** → Header, main content area, footer, sidebars
- 🔄 **Wrap multiple features** → Provide consistent structure across different pages
- 🎨 **Handle global UI concerns** → Navigation, branding, global modals, notifications
- 📱 **Manage responsive behavior** → How the app structure adapts to different screen sizes
- 🎭 **Provide app-wide context** → Global state, theme, authentication status

## 📝 **Layout vs Feature Components**

```typescript
// ✅ App-Level Layout Responsibility:
// - Page structure (header, main, footer)
// - Global navigation and branding
// - App-wide modals and notifications
// - Responsive layout behavior
// - Global context providers

// ❌ NOT Layout Responsibility:
// - Feature-specific content (that's Feature components)
// - Business logic (that's Models/Controllers)
// - Data fetching (that's Services)
// - Form handling (that's Feature views)
```

## 🏗️ **Layout Component Examples**

### **1. MainLayout - Primary App Structure**

```javascript
// src/app/layout/MainLayout.jsx
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import GlobalNotifications from "../components/GlobalNotifications";
import LoadingOverlay from "../components/LoadingOverlay";
import "./MainLayout.css";

const MainLayout = ({ children, variant = "default" }) => {
  // 🎭 LAYOUT STATE: Global UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 🎭 RESPONSIVE BEHAVIOR: Handle screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // 🎭 LAYOUT HANDLERS: Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // 🎭 GLOBAL HANDLERS: Handle notifications
  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, { ...notification, id: Date.now() }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <div className={`main-layout main-layout--${variant}`}>
      {/* 🏛️ GLOBAL STRUCTURE: Header */}
      <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* 🏛️ GLOBAL STRUCTURE: Sidebar (optional) */}
      {variant === "with-sidebar" && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* 🏛️ GLOBAL STRUCTURE: Main content area */}
      <main className={`main-layout__content ${sidebarOpen ? "main-layout__content--sidebar-open" : ""}`} role="main">
        {/* 🎭 FEATURE CONTENT: Where features render */}
        <div className="main-layout__inner">{children}</div>
      </main>

      {/* 🏛️ GLOBAL STRUCTURE: Footer */}
      <Footer />

      {/* 🎭 GLOBAL UI: Notifications */}
      <GlobalNotifications notifications={notifications} onRemove={removeNotification} />

      {/* 🎭 GLOBAL UI: Loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* 🎭 GLOBAL UI: Sidebar backdrop */}
      {sidebarOpen && (
        <div className="main-layout__backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />
      )}
    </div>
  );
};

export default MainLayout;
```

### **2. AuthLayout - Authentication Pages Structure**

```javascript
// src/app/layout/AuthLayout.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import "./AuthLayout.css";

const AuthLayout = ({ children, requireAuth = false, redirectTo = "/" }) => {
  const { user, loading } = useAuth();

  // 🔒 AUTH GUARD: Redirect logic
  if (!loading && requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && !requireAuth && user) {
    return <Navigate to={redirectTo} replace />;
  }

  // 🎨 LOADING STATE: Show while checking auth
  if (loading) {
    return (
      <div className="auth-layout__loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      {/* 🏛️ AUTH STRUCTURE: Branding section */}
      <div className="auth-layout__brand">
        <div className="auth-layout__logo">
          <img src="/logo.svg" alt="MovieApp" />
          <h1>MovieApp</h1>
        </div>
        <div className="auth-layout__tagline">
          <p>Discover your next favorite movie</p>
        </div>
      </div>

      {/* 🏛️ AUTH STRUCTURE: Form section */}
      <div className="auth-layout__content">
        <div className="auth-layout__card">{children}</div>
      </div>

      {/* 🏛️ AUTH STRUCTURE: Background decoration */}
      <div className="auth-layout__background">
        <div className="auth-layout__pattern"></div>
      </div>
    </div>
  );
};

export default AuthLayout;
```

### **3. DashboardLayout - Admin/User Dashboard Structure**

```javascript
// src/app/layout/DashboardLayout.jsx
import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import Breadcrumbs from "../components/Breadcrumbs";
import "./DashboardLayout.css";

const DashboardLayout = ({ children, title, breadcrumbs = [] }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* 🏛️ DASHBOARD STRUCTURE: Navigation sidebar */}
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* 🏛️ DASHBOARD STRUCTURE: Main content area */}
      <div className={`dashboard-layout__main ${sidebarCollapsed ? "dashboard-layout__main--sidebar-collapsed" : ""}`}>
        {/* 🏛️ DASHBOARD STRUCTURE: Top header */}
        <DashboardHeader title={title} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* 🏛️ DASHBOARD STRUCTURE: Breadcrumb navigation */}
        {breadcrumbs.length > 0 && (
          <div className="dashboard-layout__breadcrumbs">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* 🏛️ DASHBOARD STRUCTURE: Page content */}
        <div className="dashboard-layout__content">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
```

### **4. MinimalLayout - Clean Layout for Landing Pages**

```javascript
// src/app/layout/MinimalLayout.jsx
import React from "react";
import SimpleHeader from "./SimpleHeader";
import "./MinimalLayout.css";

const MinimalLayout = ({ children, showHeader = true, centerContent = false }) => {
  return (
    <div className="minimal-layout">
      {/* 🏛️ MINIMAL STRUCTURE: Optional header */}
      {showHeader && <SimpleHeader />}

      {/* 🏛️ MINIMAL STRUCTURE: Content area */}
      <main className={`minimal-layout__content ${centerContent ? "minimal-layout__content--centered" : ""}`}>
        {children}
      </main>
    </div>
  );
};

export default MinimalLayout;
```

## 🧩 **Layout Sub-Components**

### **Header Component**

```javascript
// src/app/layout/Header.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import Navigation from "./Navigation";
import UserMenu from "./UserMenu";
import SearchBar from "../../features/movies/views/components/SearchBar/SearchBar";
import "./Header.css";

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="header" role="banner">
      <div className="header__container">
        {/* 🏛️ BRANDING: Logo and app name */}
        <div className="header__brand">
          <button
            className="header__menu-toggle"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            ☰
          </button>
          <a href="/" className="header__logo">
            <img src="/logo.svg" alt="MovieApp" />
            <span className="header__title">MovieApp</span>
          </a>
        </div>

        {/* 🎭 GLOBAL SEARCH: App-wide search functionality */}
        <div className="header__search">
          <SearchBar placeholder="Search movies, actors, directors..." showFilters={false} />
        </div>

        {/* 🧭 GLOBAL NAVIGATION: Main navigation */}
        <Navigation />

        {/* 👤 USER SECTION: User-specific actions */}
        <div className="header__user">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="header__auth-buttons">
              <a href="/login" className="btn btn--ghost">
                Login
              </a>
              <a href="/register" className="btn btn--primary">
                Sign Up
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### **Footer Component**

```javascript
// src/app/layout/Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        {/* 🏛️ FOOTER STRUCTURE: Company info */}
        <div className="footer__section">
          <h3 className="footer__title">MovieApp</h3>
          <p className="footer__description">Your ultimate destination for movie discovery and reviews.</p>
          <div className="footer__social">
            <a href="#" aria-label="Facebook">
              📘
            </a>
            <a href="#" aria-label="Twitter">
              🐦
            </a>
            <a href="#" aria-label="Instagram">
              📷
            </a>
          </div>
        </div>

        {/* 🧭 FOOTER NAVIGATION: Site links */}
        <div className="footer__section">
          <h4 className="footer__subtitle">Explore</h4>
          <ul className="footer__links">
            <li>
              <a href="/movies">Popular Movies</a>
            </li>
            <li>
              <a href="/genres">Browse by Genre</a>
            </li>
            <li>
              <a href="/new-releases">New Releases</a>
            </li>
            <li>
              <a href="/top-rated">Top Rated</a>
            </li>
          </ul>
        </div>

        {/* ℹ️ FOOTER INFO: Help and legal */}
        <div className="footer__section">
          <h4 className="footer__subtitle">Support</h4>
          <ul className="footer__links">
            <li>
              <a href="/help">Help Center</a>
            </li>
            <li>
              <a href="/contact">Contact Us</a>
            </li>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>

      {/* 🏛️ FOOTER BOTTOM: Copyright */}
      <div className="footer__bottom">
        <div className="footer__container">
          <p>&copy; 2025 MovieApp. All rights reserved.</p>
          <p>Made with ❤️ for movie lovers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

## 🎯 **Layout Usage in Your MovieApp**

### **Current Usage Pattern:**

```javascript
// src/App.jsx - Your current structure
function App() {
  return (
    <div className="app">
      <MainLayout children={<Homepage />} />
    </div>
  );
}
```

### **Improved Layout Usage:**

```javascript
// src/App.jsx - Enhanced structure
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./app/layout/MainLayout";
import AuthLayout from "./app/layout/AuthLayout";
import DashboardLayout from "./app/layout/DashboardLayout";

// Feature pages
import { MoviesHomePage } from "./features/movies";
import { LoginPage, RegisterPage } from "./features/authentication";
import { UserDashboard } from "./features/users";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 PUBLIC PAGES: Use MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <MoviesHomePage />
            </MainLayout>
          }
        />

        <Route
          path="/movies"
          element={
            <MainLayout>
              <MoviesHomePage />
            </MainLayout>
          }
        />

        {/* 🔐 AUTH PAGES: Use AuthLayout */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        {/* 📊 DASHBOARD PAGES: Use DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout
              title="Dashboard"
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Dashboard", href: "/dashboard" }
              ]}
            >
              <UserDashboard />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}
```

## 📱 **Layout Types and When to Use Them**

### **1. MainLayout**

**Use for:** Public pages, feature pages, general app content

- Homepage, movie listings, search results
- User profiles, movie details
- Most of your app's pages

### **2. AuthLayout**

**Use for:** Authentication and onboarding flows

- Login, register, forgot password pages
- Welcome screens, onboarding steps
- Clean, focused user experience

### **3. DashboardLayout**

**Use for:** Admin panels, user dashboards, management interfaces

- User account management
- Admin movie management
- Analytics and reporting pages

### **4. MinimalLayout**

**Use for:** Landing pages, error pages, standalone content

- 404 error pages, maintenance pages
- Marketing landing pages
- Simple content pages

### **5. FullscreenLayout**

**Use for:** Immersive experiences

- Movie player pages
- Image galleries, presentations
- Focused content without distractions

## ✅ **Layout Component Benefits**

### **1. Consistency**

- ✅ Same structure across similar page types
- ✅ Consistent navigation and branding
- ✅ Uniform responsive behavior

### **2. Reusability**

- ✅ One layout component serves multiple pages
- ✅ Easy to update global structure
- ✅ Shared navigation and footer logic

### **3. Separation of Concerns**

- ✅ Layout handles structure, features handle content
- ✅ Clear boundaries between global and feature-specific UI
- ✅ Easy to test and maintain

### **4. User Experience**

- ✅ Predictable navigation patterns
- ✅ Consistent visual hierarchy
- ✅ Responsive design handled at layout level

## 🏗️ **Layout Checklist**

App-level layouts should:

- ✅ **Define** overall page structure and navigation
- ✅ **Handle** responsive layout behavior
- ✅ **Provide** global UI components (header, footer, notifications)
- ✅ **Wrap** feature content without controlling it
- ✅ **Maintain** consistent branding and styling

App-level layouts should NOT:

- ❌ **Contain** feature-specific content
- ❌ **Handle** business logic
- ❌ **Make** API calls for content data
- ❌ **Manage** feature-specific state
- ❌ **Implement** feature workflows

**App-level layouts are the architectural foundation that gives your app its structure and identity!** 🏗️
