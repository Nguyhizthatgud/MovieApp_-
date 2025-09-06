# Authentication Integration Examples

## 🔗 How to Use Authentication in Your MovieApp

### 1. App-Level Integration

```typescript
// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/authentication";
import MainLayout from "./Layout/MainLayout";
import ModernMoviePage from "./pages/ModernMoviePage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ModernMoviePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProtectedProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 2. Protecting Movie Routes

```typescript
// src/pages/MoviesPage.tsx
import React from "react";
import { ProtectedRoute, useAuth } from "@/features/authentication";
import { MovieList } from "@/features/movies";

const MoviesPage = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1>Welcome back, {user?.name}!</h1>
        <MovieList />
      </div>
    </ProtectedRoute>
  );
};

export default MoviesPage;
```

### 3. Adding Auth to Header

```typescript
// src/Layout/HeaderLayout.jsx
import React from "react";
import { Button, Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "@/features/authentication";

const HeaderLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile"
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout
    }
  ];

  return (
    <header className="flex justify-between items-center p-4">
      <div className="logo">
        <h1>MovieApp</h1>
      </div>

      <div className="auth-section">
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <span className="ml-2 text-white">{user?.name}</span>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" href="/login">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default HeaderLayout;
```

### 4. Creating Login Page

```typescript
// src/pages/LoginPage.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/features/authentication";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = () => {
    // Redirect to intended page or home
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoginForm onSuccess={handleLoginSuccess} className="bg-gray-800 text-white" />
    </div>
  );
};

export default LoginPage;
```

### 5. Movie Features with Auth

```typescript
// src/features/movies/components/MovieCard.tsx
import React from "react";
import { Card, Button } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useAuth } from "@/features/authentication";
import { Movie } from "../types/movie.types";

interface MovieCardProps {
  movie: Movie;
  onAddToWishlist?: (movieId: number) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onAddToWishlist }) => {
  const { isAuthenticated, user } = useAuth();

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      onAddToWishlist?.(movie.id);
    } else {
      // Redirect to login or show login modal
      window.location.href = "/login";
    }
  };

  return (
    <Card
      cover={<img src={movie.poster_path} alt={movie.title} />}
      actions={[
        <Button
          key="wishlist"
          type="text"
          icon={<HeartOutlined />}
          onClick={handleWishlistClick}
          disabled={!isAuthenticated}
        >
          {isAuthenticated ? "Add to Wishlist" : "Login to Save"}
        </Button>
      ]}
    >
      <Card.Meta title={movie.title} description={movie.overview} />

      {/* Show user-specific content */}
      {isAuthenticated && <div className="mt-2 text-sm text-gray-500">Welcome back, {user?.name}!</div>}
    </Card>
  );
};
```

### 6. Conditional Rendering Based on Auth

```typescript
// src/features/movies/components/MoviePage.tsx
import React from "react";
import { Button, message } from "antd";
import { useAuth, usePermissions } from "@/features/authentication";
import { MovieList } from "./MovieList";

const MoviePage = () => {
  const { isAuthenticated, user } = useAuth();
  const { canCreateContent, isAdmin } = usePermissions();

  const handleCreatePlaylist = () => {
    if (!isAuthenticated) {
      message.warning("Please login to create playlists");
      return;
    }
    // Create playlist logic
  };

  return (
    <div className="movie-page">
      <div className="header flex justify-between items-center mb-6">
        <h1>Movies</h1>

        <div className="actions space-x-2">
          {canCreateContent && (
            <Button type="primary" onClick={handleCreatePlaylist}>
              Create Playlist
            </Button>
          )}

          {isAdmin && <Button type="default">Admin Panel</Button>}

          {!isAuthenticated && (
            <Button type="primary" href="/login">
              Sign In for More Features
            </Button>
          )}
        </div>
      </div>

      <MovieList />

      {/* Show different content based on auth status */}
      {isAuthenticated ? (
        <div className="user-recommendations mt-8">
          <h2>Recommended for {user?.name}</h2>
          {/* Personalized content */}
        </div>
      ) : (
        <div className="guest-cta mt-8 text-center p-6 bg-blue-50 rounded">
          <h3>Get Personalized Recommendations</h3>
          <p>Sign up to get movie recommendations based on your preferences</p>
          <Button type="primary" size="large" href="/login">
            Sign Up Free
          </Button>
        </div>
      )}
    </div>
  );
};
```

### 7. API Integration with Auth

```typescript
// src/features/movies/services/movieApi.ts
import { apiClient } from "@/shared/services/apiClient";
import { tokenService } from "@/features/authentication/services/tokenService";

// Update API client to include auth headers
apiClient.interceptors.request.use((config) => {
  const authHeader = tokenService.getAuthHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader;
  }
  return config;
});

// Movie service can now make authenticated requests
export const movieApi = {
  // Public endpoints (no auth required)
  getPopular: () => apiClient.get("/movies/popular"),
  getTrending: () => apiClient.get("/movies/trending"),

  // Protected endpoints (auth required)
  getWishlist: () => apiClient.get("/users/wishlist"),
  addToWishlist: (movieId: number) => apiClient.post("/users/wishlist", { movieId }),
  removeFromWishlist: (movieId: number) => apiClient.delete(`/users/wishlist/${movieId}`),

  // User-specific endpoints
  getRecommendations: () => apiClient.get("/users/recommendations"),
  getUserRatings: () => apiClient.get("/users/ratings"),
  rateMovie: (movieId: number, rating: number) => apiClient.post("/movies/rate", { movieId, rating })
};
```

## 🎯 File Organization Summary

```
src/
├── features/
│   ├── authentication/           🔐 All auth logic here
│   │   ├── components/          📦 LoginForm, ProtectedRoute, etc.
│   │   ├── hooks/               🎣 useAuth, useAuthGuard, etc.
│   │   ├── services/            🔌 authApi, tokenService, etc.
│   │   ├── context/             🌍 AuthContext, AuthProvider
│   │   ├── types/               📝 User, AuthState, etc.
│   │   └── index.ts             🚪 Public API
│   ├── movies/                  🎬 Movie features use auth
│   │   ├── components/          📦 MovieCard (with auth integration)
│   │   ├── hooks/               🎣 useMovies (with auth)
│   │   └── services/            🔌 movieApi (with auth headers)
│   └── profile/                 👤 User profile features
├── pages/                       📄 Page components
│   ├── LoginPage.tsx           🔑 Login page
│   ├── MoviesPage.tsx          🎬 Protected movies page
│   └── ProfilePage.tsx         👤 User profile page
└── Layout/                      🏗️ Layout with auth integration
    ├── HeaderLayout.jsx        📱 Header with login/logout
    └── MainLayout.jsx          🏠 Main layout with auth provider
```

This structure keeps authentication organized in its own feature while making it easy to integrate with other parts of your app!
