# Theme Provider Placement Guide

## 🎨 Where to Place Theme Provider

Theme providers are **app-level infrastructure** that affect the entire application, so they should be placed in the **`/app`** directory, not in `/features` or `/shared`.

## 📁 Recommended Theme Structure

```
src/
├── app/                        ⚙️ App-level configuration
│   ├── providers/             🏪 All app-level providers
│   │   ├── ThemeProvider.tsx  🎨 Theme provider component
│   │   ├── AppProviders.tsx   📦 Combined providers wrapper
│   │   └── index.ts           🚪 Provider exports
│   ├── theme/                 🎨 Theme configuration
│   │   ├── colors.ts          🌈 Color definitions
│   │   ├── tokens.ts          🎯 Design tokens
│   │   ├── components.ts      📦 Component theme overrides
│   │   ├── darkTheme.ts       🌙 Dark theme configuration
│   │   ├── lightTheme.ts      ☀️ Light theme configuration
│   │   └── index.ts           🚪 Theme exports
│   ├── store/                 📊 Global state management
│   └── router/                🛣️ Router configuration
├── features/                  🎯 Business features
│   ├── authentication/       🔐 Auth feature
│   └── movies/               🎬 Movie feature
└── shared/                    🤝 Shared utilities
    ├── components/ui/        🎨 UI components (use theme)
    ├── hooks/                🎣 Generic hooks
    └── utils/                🛠️ Utilities
```

## 🎨 Theme Provider Implementation

### 1. Theme Configuration Files

```typescript
// src/app/theme/colors.ts
export const colors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    900: "#0c4a6e"
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    800: "#1f2937",
    900: "#111827"
  },
  // Movie app specific colors
  movie: {
    gold: "#ffd700",
    silver: "#c0c0c0",
    bronze: "#cd7f32"
  }
};

// src/app/theme/tokens.ts
export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem"
};

export const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    serif: ["Georgia", "serif"],
    mono: ["Fira Code", "monospace"]
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem"
  }
};

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
};
```

### 2. Theme Definitions

```typescript
// src/app/theme/lightTheme.ts
import { colors, spacing, typography } from "./tokens";

export const lightTheme = {
  name: "light",
  colors: {
    primary: colors.primary[600],
    secondary: colors.gray[600],
    background: {
      primary: "#ffffff",
      secondary: colors.gray[50],
      tertiary: colors.gray[100]
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      tertiary: colors.gray[500]
    },
    border: colors.gray[200],
    // Movie-specific colors
    rating: {
      excellent: colors.movie.gold,
      good: colors.movie.silver,
      average: colors.movie.bronze
    }
  },
  spacing,
  typography,
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  }
};

// src/app/theme/darkTheme.ts
export const darkTheme = {
  name: "dark",
  colors: {
    primary: colors.primary[500],
    secondary: colors.gray[400],
    background: {
      primary: colors.gray[900],
      secondary: colors.gray[800],
      tertiary: colors.gray[700]
    },
    text: {
      primary: "#ffffff",
      secondary: colors.gray[300],
      tertiary: colors.gray[400]
    },
    border: colors.gray[700],
    rating: {
      excellent: colors.movie.gold,
      good: colors.movie.silver,
      average: colors.movie.bronze
    }
  },
  spacing,
  typography,
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.25)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.3)"
  }
};
```

### 3. Theme Provider Component

```typescript
// src/app/providers/ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ConfigProvider } from "antd";
import { lightTheme, darkTheme } from "../theme";

type ThemeMode = "light" | "dark";
type Theme = typeof lightTheme;

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dark" // MovieApp defaults to dark
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage or system preference
    const stored = localStorage.getItem("theme-mode") as ThemeMode;
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return defaultTheme;
  });

  const theme = mode === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    // Save theme preference
    localStorage.setItem("theme-mode", mode);

    // Apply theme to document
    document.documentElement.setAttribute("data-theme", mode);

    // Update CSS custom properties
    const root = document.documentElement;
    Object.entries(theme.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--bg-${key}`, value);
    });
    Object.entries(theme.colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });
  }, [mode, theme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Ant Design theme configuration
  const antdTheme = {
    token: {
      colorPrimary: theme.colors.primary,
      colorBgBase: theme.colors.background.primary,
      colorTextBase: theme.colors.text.primary,
      colorBorder: theme.colors.border,
      borderRadius: 6,
      fontFamily: theme.typography.fontFamily.sans.join(", ")
    },
    algorithm:
      mode === "dark"
        ? require("antd/es/theme/darkAlgorithm").default
        : require("antd/es/theme/defaultAlgorithm").default
  };

  const value: ThemeContextValue = {
    theme,
    mode,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
```

### 4. Combined App Providers

```typescript
// src/app/providers/AppProviders.tsx
import React, { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "../../features/authentication";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  }
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
```

### 5. App Integration

```typescript
// src/App.tsx
import React from "react";
import { AppProviders } from "./app/providers";
import { AppRouter } from "./app/router";
import "./app/theme/globals.css";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
```

## 🎯 Why Place Theme in `/app`?

### ✅ Correct Placement Reasoning:

1. **App-Level Concern**: Themes affect the entire application
2. **Infrastructure**: Theme is configuration, not a business feature
3. **Global State**: Theme state is needed everywhere
4. **Provider Pattern**: Wraps the entire app at the root level

### ❌ Wrong Placements:

```
src/features/theme/          ❌ Theme is not a business feature
src/shared/theme/            ❌ Too generic, not app-specific
src/components/ThemeProvider/ ❌ Not a component, it's infrastructure
src/utils/theme/             ❌ Not a utility, it's app configuration
```

## 🔗 Integration with Features

### How Features Use Theme

```typescript
// src/features/movies/components/MovieCard.tsx
import React from "react";
import { useTheme } from "../../../app/providers/ThemeProvider";

export const MovieCard = ({ movie }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
        borderRadius: "8px",
        padding: theme.spacing.md
      }}
    >
      <h3>{movie.title}</h3>
      <div style={{ color: theme.colors.rating.excellent }}>⭐ {movie.rating}</div>
    </div>
  );
};
```

### Shared UI Components Use Theme

```typescript
// src/shared/components/ui/Button.tsx
import React from "react";
import { useTheme } from "../../../app/providers/ThemeProvider";

interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", children }) => {
  const { theme } = useTheme();

  const styles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: "white"
    },
    secondary: {
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary
    }
  };

  return <button style={styles[variant]}>{children}</button>;
};
```

## 📊 Complete App Structure

```
src/
├── app/                        ⚙️ App-level configuration
│   ├── providers/             🏪 All app providers
│   │   ├── ThemeProvider.tsx  🎨 Theme provider
│   │   ├── AppProviders.tsx   📦 Combined providers
│   │   └── index.ts
│   ├── theme/                 🎨 Theme system
│   │   ├── colors.ts
│   │   ├── tokens.ts
│   │   ├── lightTheme.ts
│   │   ├── darkTheme.ts
│   │   └── index.ts
│   ├── router/                🛣️ App routing
│   └── store/                 📊 Global state
├── features/                  🎯 Business features (use theme)
│   ├── authentication/
│   └── movies/
├── shared/                    🤝 Shared code (use theme)
│   ├── components/ui/
│   └── hooks/
└── pages/                     📄 Pages (use theme)
```

## 🎉 Benefits of This Structure

1. **Clear Separation**: App infrastructure vs business features
2. **Global Access**: Theme available throughout the app
3. **Centralized**: All theme logic in one place
4. **Scalable**: Easy to add new themes or modify existing ones
5. **Type Safe**: Full TypeScript support for theme values

This structure keeps your theme provider at the app level where it belongs, while making it easy for all features and components to access theme values!
