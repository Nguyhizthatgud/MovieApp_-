# Integrating Theme Provider into Your MovieApp

## 🔄 Step-by-Step Integration

### 1. Update Your App.tsx

```typescript
// src/App.tsx
import React from "react";
import { AppProviders } from "./app/providers";
import MainLayout from "./Layout/MainLayout";
import "./app/theme/globals.css"; // Add global theme styles

function App() {
  return (
    <AppProviders>
      <div className="App">
        <MainLayout>{/* Your existing app content */}</MainLayout>
      </div>
    </AppProviders>
  );
}

export default App;
```

### 2. Update Header with Theme Toggle

```typescript
// src/Layout/HeaderLayout.jsx
import React from "react";
import { Button, Switch } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "../app/providers";

const HeaderLayout = () => {
  const { mode, toggleTheme, theme } = useTheme();

  return (
    <header
      className="header"
      style={{
        backgroundColor: theme.components.header.background,
        backdropFilter: theme.components.header.backdropFilter,
        borderBottom: `1px solid ${theme.colors.border.primary}`
      }}
    >
      <div className="header-content">
        <div className="logo">
          <h1 style={{ color: theme.colors.text.primary }}>🎬 MovieApp</h1>
        </div>

        <div className="header-actions">
          {/* Theme Toggle */}
          <div className="theme-toggle">
            <SunOutlined style={{ color: theme.colors.text.secondary }} />
            <Switch
              checked={mode === "dark"}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
            <MoonOutlined style={{ color: theme.colors.text.secondary }} />
          </div>

          {/* Other header actions */}
          <Button type="primary">Sign In</Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderLayout;
```

### 3. Update Movie Components with Theme

```typescript
// src/features/movies/components/MovieCard.tsx
import React from "react";
import { Card, Typography } from "antd";
import { StarFilled } from "@ant-design/icons";
import { useTheme } from "../../../app/providers";

const { Text } = Typography;

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    overview: string;
  };
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const { theme } = useTheme();

  // Determine rating color based on theme
  const getRatingColor = (rating: number) => {
    if (rating >= 8.0) return theme.colors.movie.rating.excellent;
    if (rating >= 6.0) return theme.colors.movie.rating.good;
    if (rating >= 4.0) return theme.colors.movie.rating.average;
    return theme.colors.movie.rating.poor;
  };

  return (
    <Card
      hoverable
      cover={
        <div style={{ position: "relative" }}>
          <img
            alt={movie.title}
            src={movie.poster_path}
            style={{
              height: "300px",
              objectFit: "cover",
              width: "100%"
            }}
          />
          <div
            style={{
              position: "absolute",
              top: theme.spacing[2],
              right: theme.spacing[2],
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: theme.borderRadius.md,
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1]
            }}
          >
            <StarFilled style={{ color: getRatingColor(movie.vote_average) }} />
            <Text style={{ color: "#ffffff", fontSize: theme.typography.fontSize.sm }}>
              {movie.vote_average.toFixed(1)}
            </Text>
          </div>
        </div>
      }
      style={{
        backgroundColor: theme.components.card.background,
        border: `1px solid ${theme.components.card.border}`,
        boxShadow: theme.components.card.shadow
      }}
    >
      <Card.Meta
        title={
          <Text
            strong
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg
            }}
          >
            {movie.title}
          </Text>
        }
        description={
          <Text
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm
            }}
          >
            {movie.overview.length > 100 ? `${movie.overview.substring(0, 100)}...` : movie.overview}
          </Text>
        }
      />
    </Card>
  );
};
```

### 4. Update MainLayout with Theme

```typescript
// src/Layout/MainLayout.jsx
import React from "react";
import { Layout } from "antd";
import { useTheme } from "../app/providers";
import HeaderLayout from "./HeaderLayout";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.background.primary
      }}
    >
      <Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1000,
          backgroundColor: theme.components.header.background,
          backdropFilter: theme.components.header.backdropFilter,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          padding: 0,
          height: "64px",
          display: "flex",
          alignItems: "center"
        }}
      >
        <HeaderLayout />
      </Header>

      <Content
        style={{
          marginTop: "64px", // Account for fixed header
          padding: theme.spacing[6],
          backgroundColor: theme.colors.background.primary,
          color: theme.colors.text.primary
        }}
      >
        {children}
      </Content>

      <Footer
        style={{
          textAlign: "center",
          backgroundColor: theme.colors.background.secondary,
          color: theme.colors.text.secondary,
          borderTop: `1px solid ${theme.colors.border.primary}`
        }}
      >
        MovieApp ©2024 - Built with React & Ant Design
      </Footer>
    </Layout>
  );
};

export default MainLayout;
```

### 5. Add Global Theme Styles

```css
/* src/app/theme/globals.css */
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-sans);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Theme-aware scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-secondary);
}

/* Dark theme styles */
[data-theme="dark"] {
  color-scheme: dark;
}

[data-theme="dark"] ::-webkit-scrollbar-track {
  background: #1f2937;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: #374151;
}

/* Light theme styles */
[data-theme="light"] {
  color-scheme: light;
}

[data-theme="light"] ::-webkit-scrollbar-track {
  background: #f3f4f6;
}

[data-theme="light"] ::-webkit-scrollbar-thumb {
  background: #d1d5db;
}

/* Utility classes for theme-aware styling */
.theme-bg-primary {
  background-color: var(--bg-primary);
}

.theme-bg-secondary {
  background-color: var(--bg-secondary);
}

.theme-text-primary {
  color: var(--text-primary);
}

.theme-text-secondary {
  color: var(--text-secondary);
}

.theme-border {
  border-color: var(--border-primary);
}

/* Movie rating styles */
.rating-excellent {
  color: var(--movie-rating-excellent);
}

.rating-good {
  color: var(--movie-rating-good);
}

.rating-average {
  color: var(--movie-rating-average);
}

.rating-poor {
  color: var(--movie-rating-poor);
}
```

### 6. Theme Hook Usage Examples

```typescript
// Example: Theme-aware component
import React from "react";
import { useTheme } from "../../app/providers";

const ThemedComponent = () => {
  const { theme, mode, toggleTheme, isDark, isLight } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.md
      }}
    >
      <h2>Current Theme: {mode}</h2>
      <p>Is Dark Mode: {isDark ? "Yes" : "No"}</p>

      <button
        onClick={toggleTheme}
        style={{
          backgroundColor: theme.colors.primary,
          color: theme.colors.text.inverse,
          border: "none",
          padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
          borderRadius: theme.borderRadius.DEFAULT,
          cursor: "pointer"
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
};
```

## 🎯 Benefits of This Structure

1. **Centralized Theming**: All theme logic in `/app/theme`
2. **Global Access**: `useTheme()` hook available everywhere
3. **Automatic Persistence**: Theme choice saved to localStorage
4. **System Integration**: Respects user's OS theme preference
5. **Ant Design Integration**: Seamless integration with Ant Design components
6. **Type Safety**: Full TypeScript support for theme values
7. **CSS Variables**: Theme values available as CSS custom properties

This structure keeps your theme provider properly organized at the app level while making it easy for all components to access and use theme values!
