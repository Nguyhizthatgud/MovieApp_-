# Modern React Theme Architecture Guide

## 🎨 Theme Provider Placement Strategy

### **Primary Location: `src/app/theme/` or `src/app/providers/`**

Theme providers should be in the app layer because they:

- Provide global application styling context
- Configure app-wide design system
- Handle theme switching logic
- Manage CSS-in-JS or design tokens

### **Alternative Structure: Combined Providers**

```
src/app/providers/
├── ThemeProvider.jsx
├── AuthProvider.jsx
├── QueryProvider.jsx
└── AppProviders.jsx    # Combines all providers
```

## 🏗️ Recommended Theme Structure

```
src/
├── app/
│   ├── theme/
│   │   ├── index.js              # Main theme export
│   │   ├── ThemeProvider.jsx     # Theme context provider
│   │   ├── themes/
│   │   │   ├── light.theme.js    # Light theme tokens
│   │   │   ├── dark.theme.js     # Dark theme tokens
│   │   │   └── index.js          # Theme exports
│   │   ├── tokens/
│   │   │   ├── colors.js         # Color tokens
│   │   │   ├── typography.js     # Typography tokens
│   │   │   ├── spacing.js        # Spacing tokens
│   │   │   └── breakpoints.js    # Responsive breakpoints
│   │   └── hooks/
│   │       ├── useTheme.js       # Theme hook
│   │       └── useColorMode.js   # Dark/light mode hook
│   └── providers/
│       └── AppProviders.jsx      # Root providers wrapper
├── shared/
│   ├── styles/
│   │   ├── globals.css           # Global styles
│   │   ├── reset.css             # CSS reset
│   │   └── utilities.css         # Utility classes
│   └── components/
│       └── ui/                   # Themed UI components
└── features/
    └── [feature]/
        └── styles/               # Feature-specific styles
```

## 📋 Implementation Examples

### 1. Theme Provider (`src/app/theme/ThemeProvider.jsx`)

```jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as AntdThemeProvider } from "antd";
import { lightTheme, darkTheme } from "./themes";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDarkMode(shouldUseDark);
    setTheme(shouldUseDark ? darkTheme : lightTheme);
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : lightTheme);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Update CSS custom properties
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [isDarkMode, theme]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <AntdThemeProvider theme={theme.antd}>
        <div className={isDarkMode ? "dark" : "light"}>{children}</div>
      </AntdThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
```

### 2. Theme Tokens (`src/app/theme/tokens/colors.js`)

```javascript
// Base color palette
export const colors = {
  // Primary colors
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    900: "#1e3a8a"
  },

  // Semantic colors
  success: {
    50: "#f0fdf4",
    500: "#22c55e",
    600: "#16a34a"
  },

  error: {
    50: "#fef2f2",
    500: "#ef4444",
    600: "#dc2626"
  },

  warning: {
    50: "#fffbeb",
    500: "#f59e0b",
    600: "#d97706"
  },

  // Neutral colors
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827"
  }
};

// Theme-specific color mappings
export const lightColors = {
  background: colors.gray[50],
  surface: colors.gray[100],
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    disabled: colors.gray[400]
  },
  border: colors.gray[200]
};

export const darkColors = {
  background: colors.gray[900],
  surface: colors.gray[800],
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    disabled: colors.gray[500]
  },
  border: colors.gray[700]
};
```

### 3. Complete Theme Objects (`src/app/theme/themes/light.theme.js`)

```javascript
import { lightColors, colors } from "../tokens/colors";
import { typography } from "../tokens/typography";
import { spacing } from "../tokens/spacing";
import { breakpoints } from "../tokens/breakpoints";

export const lightTheme = {
  name: "light",
  colors: {
    ...lightColors,
    primary: colors.primary[500],
    success: colors.success[500],
    error: colors.error[500],
    warning: colors.warning[500]
  },
  typography,
  spacing,
  breakpoints,

  // Ant Design theme configuration
  antd: {
    token: {
      colorPrimary: colors.primary[500],
      colorBgBase: lightColors.background,
      colorTextBase: lightColors.text.primary,
      borderRadius: 8,
      wireframe: false
    },
    algorithm: [], // Default algorithm for light theme
    components: {
      Button: {
        primaryShadow: "0 2px 4px rgba(59, 130, 246, 0.15)"
      },
      Card: {
        headerBg: lightColors.surface
      }
    }
  },

  // CSS custom properties
  cssVars: {
    "--color-primary": colors.primary[500],
    "--color-background": lightColors.background,
    "--color-surface": lightColors.surface,
    "--color-text-primary": lightColors.text.primary,
    "--color-text-secondary": lightColors.text.secondary,
    "--color-border": lightColors.border
  }
};
```

### 4. Dark Theme (`src/app/theme/themes/dark.theme.js`)

```javascript
import { theme as antdTheme } from "antd";
import { darkColors, colors } from "../tokens/colors";
import { typography } from "../tokens/typography";
import { spacing } from "../tokens/spacing";
import { breakpoints } from "../tokens/breakpoints";

export const darkTheme = {
  name: "dark",
  colors: {
    ...darkColors,
    primary: colors.primary[400], // Lighter shade for dark theme
    success: colors.success[400],
    error: colors.error[400],
    warning: colors.warning[400]
  },
  typography,
  spacing,
  breakpoints,

  // Ant Design dark theme configuration
  antd: {
    token: {
      colorPrimary: colors.primary[400],
      colorBgBase: darkColors.background,
      colorTextBase: darkColors.text.primary,
      borderRadius: 8,
      wireframe: false
    },
    algorithm: [antdTheme.darkAlgorithm], // Dark theme algorithm
    components: {
      Button: {
        primaryShadow: "0 2px 4px rgba(96, 165, 250, 0.15)"
      },
      Card: {
        headerBg: darkColors.surface
      }
    }
  },

  // CSS custom properties for dark theme
  cssVars: {
    "--color-primary": colors.primary[400],
    "--color-background": darkColors.background,
    "--color-surface": darkColors.surface,
    "--color-text-primary": darkColors.text.primary,
    "--color-text-secondary": darkColors.text.secondary,
    "--color-border": darkColors.border
  }
};
```

### 5. Theme Hook (`src/app/theme/hooks/useTheme.js`)

```javascript
import { useContext } from "react";
import { ThemeContext } from "../ThemeProvider";

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Convenience hook for color mode
export const useColorMode = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return {
    colorMode: isDarkMode ? "dark" : "light",
    toggleColorMode: toggleTheme,
    isDark: isDarkMode,
    isLight: !isDarkMode
  };
};
```

### 6. App Providers Wrapper (`src/app/providers/AppProviders.jsx`)

```jsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ThemeProvider from "../theme/ThemeProvider";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  }
});

const AppProviders = ({ children }) => {
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

export default AppProviders;
```

### 7. Theme Integration in Components

```jsx
// Using theme in components
import React from "react";
import { useTheme, useColorMode } from "@/app/theme/hooks/useTheme";
import { Button } from "antd";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

const ThemeToggle = () => {
  const { toggleColorMode, isDark } = useColorMode();

  return (
    <Button
      type="text"
      icon={isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      onClick={toggleColorMode}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    />
  );
};

// Using theme tokens directly
const MovieCard = ({ movie }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        color: theme.colors.text.primary
      }}
      className="p-4 rounded-lg border"
    >
      <h3 style={{ color: theme.colors.text.primary }}>{movie.title}</h3>
      <p style={{ color: theme.colors.text.secondary }}>{movie.overview}</p>
    </div>
  );
};
```

### 8. Main App Integration (`src/App.jsx`)

```jsx
import React from "react";
import AppProviders from "./app/providers/AppProviders";
import { AppRouter } from "./app/routes";
import "./shared/styles/globals.css";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
```

### 9. Global CSS with Theme Variables (`src/shared/styles/globals.css`)

```css
/* Theme CSS Custom Properties */
:root {
  /* Will be updated by ThemeProvider */
  --color-primary: #3b82f6;
  --color-background: #f9fafb;
  --color-surface: #ffffff;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
}

/* Base styles using theme variables */
body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Utility classes */
.bg-surface {
  background-color: var(--color-surface);
}

.text-primary {
  color: var(--color-text-primary);
}

.text-secondary {
  color: var(--color-text-secondary);
}

.border-default {
  border-color: var(--color-border);
}
```

## 🎯 Best Practices for Theme Architecture

### 1. **Provider Placement**

- ✅ Place in `src/app/theme/` or `src/app/providers/`
- ✅ Wrap at the app root level
- ✅ Initialize before feature components

### 2. **Theme Structure**

- Use design tokens for consistency
- Separate light/dark theme configurations
- Include framework-specific configs (Ant Design)
- Provide CSS custom properties for styling

### 3. **Performance**

- Lazy load theme configurations
- Use CSS custom properties for runtime updates
- Minimize re-renders with proper context structure

### 4. **Developer Experience**

- Provide TypeScript types for themes
- Create utility hooks for common operations
- Include theme debugging tools in development

## ✅ Your Current Setup Assessment

Your current structure with `src/app/theme/` is perfect! You're following modern React architecture patterns correctly by placing theme providers in the app layer where they belong.

## 📱 Integration with Your Movie App

For your movie app specifically, you should:

1. Keep theme provider in `src/app/theme/` ✅
2. Configure Ant Design themes for your movie components
3. Add dark/light mode toggle in your header
4. Use theme tokens for consistent movie card styling
5. Ensure proper contrast for movie posters and text
