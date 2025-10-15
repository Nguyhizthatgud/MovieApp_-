# API Services Placement Guide

## 📍 Where to Place API Fetching Files

### **Feature-Specific APIs** (Recommended for most cases)

```
src/features/movies/services/
├── movieApi.js          # Movie-specific API calls
├── genreApi.js          # Genre-specific API calls
└── index.js             # Clean exports

src/features/auth/services/
├── authApi.js           # Authentication API calls
└── index.js
```

### **Shared APIs** (For cross-feature services)

```
src/shared/services/
├── api/
│   ├── client.js        # Base API client (Axios setup)
│   ├── endpoints.js     # API endpoint constants
│   └── interceptors.js  # Request/response interceptors
├── tmdb/
│   ├── tmdbClient.js    # TMDB-specific client
│   └── tmdbConfig.js    # TMDB configuration
└── index.js
```

### **App-Level APIs** (For global configuration)

```
src/app/services/
├── apiConfig.js         # Global API configuration
├── errorHandler.js      # Global error handling
└── index.js
```

## 🎬 **Movie App API Structure Example**

### 1. Base API Client (`src/shared/services/api/client.js`)

```javascript
import axios from "axios";

// Base API client configuration
const createApiClient = (baseURL, defaultHeaders = {}) => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders
    }
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log requests in development
      if (process.env.NODE_ENV === "development") {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error) => {
      console.error("❌ Request Error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // Log responses in development
      if (process.env.NODE_ENV === "development") {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }

      return response;
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }

      if (error.response?.status >= 500) {
        console.error("🔥 Server Error:", error.response);
      }

      console.error("❌ Response Error:", error);
      return Promise.reject(error);
    }
  );

  return client;
};

// TMDB API client
// export const tmdbClient = createApiClient("https://api.themoviedb.org/3", {
//   Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`
// });

// Your app's backend API client (if you have one)
// export const appApiClient = createApiClient(import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api");

export default tmdbClient;
```

### 2. API Endpoints (`src/shared/services/api/endpoints.js`)

```javascript
// TMDB API endpoints
export const TMDB_ENDPOINTS = {
  // Movies
  MOVIE_POPULAR: "/movie/popular",
  MOVIE_TOP_RATED: "/movie/top_rated",
  MOVIE_UPCOMING: "/movie/upcoming",
  MOVIE_NOW_PLAYING: "/movie/now_playing",
  MOVIE_DETAILS: (id) => `/movie/${id}`,
  MOVIE_CREDITS: (id) => `/movie/${id}/credits`,
  MOVIE_VIDEOS: (id) => `/movie/${id}/videos`,
  MOVIE_SIMILAR: (id) => `/movie/${id}/similar`,
  MOVIE_RECOMMENDATIONS: (id) => `/movie/${id}/recommendations`,

  // Search
  SEARCH_MOVIE: "/search/movie",
  SEARCH_MULTI: "/search/multi",

  // Genres
  MOVIE_GENRES: "/genre/movie/list",

  // Trending
  TRENDING_MOVIES_DAY: "/trending/movie/day",
  TRENDING_MOVIES_WEEK: "/trending/movie/week",

  // Discovery
  DISCOVER_MOVIES: "/discover/movie",

  // Configuration
  CONFIGURATION: "/configuration",

  // Images
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p/",

  // Person
  PERSON_DETAILS: (id) => `/person/${id}`,
  PERSON_MOVIE_CREDITS: (id) => `/person/${id}/movie_credits`
};

// Your app's API endpoints (if you have a backend)
export const APP_ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",

  // User
  USER_PROFILE: "/user/profile",
  USER_PREFERENCES: "/user/preferences",
  USER_WATCHLIST: "/user/watchlist",
  USER_FAVORITES: "/user/favorites",

  // Reviews
  MOVIE_REVIEWS: (movieId) => `/movies/${movieId}/reviews`,
  USER_REVIEWS: "/user/reviews"
};
```

### 3. Movie API Service (`src/features/movies/services/movieApi.js`)

```javascript
import { tmdbClient } from "@/shared/services/api/client";
import { TMDB_ENDPOINTS } from "@/shared/services/api/endpoints";

class MovieApiService {
  /**
   * Get popular movies
   */
  async getPopular(page = 1) {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.MOVIE_POPULAR, {
        params: { page }
      });
      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch popular movies: ${error.message}`);
    }
  }

  /**
   * Get top rated movies
   */
  async getTopRated(page = 1) {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.MOVIE_TOP_RATED, {
        params: { page }
      });
      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch top rated movies: ${error.message}`);
    }
  }

  /**
   * Get upcoming movies
   */
  async getUpcoming(page = 1) {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.MOVIE_UPCOMING, {
        params: { page }
      });
      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch upcoming movies: ${error.message}`);
    }
  }

  /**
   * Get now playing movies
   */
  async getNowPlaying(page = 1) {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.MOVIE_NOW_PLAYING, {
        params: { page }
      });
      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch now playing movies: ${error.message}`);
    }
  }

  /**
   * Get movie details by ID
   */
  async getMovieDetails(movieId) {
    try {
      const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
        tmdbClient.get(TMDB_ENDPOINTS.MOVIE_DETAILS(movieId)),
        tmdbClient.get(TMDB_ENDPOINTS.MOVIE_CREDITS(movieId)),
        tmdbClient.get(TMDB_ENDPOINTS.MOVIE_VIDEOS(movieId))
      ]);

      return {
        movie: movieResponse.data,
        credits: creditsResponse.data,
        videos: videosResponse.data.results
      };
    } catch (error) {
      throw new Error(`Failed to fetch movie details: ${error.message}`);
    }
  }

  /**
   * Search movies
   */
  async searchMovies(query, page = 1) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          movies: [],
          totalPages: 0,
          totalResults: 0,
          currentPage: 1
        };
      }

      const response = await tmdbClient.get(TMDB_ENDPOINTS.SEARCH_MOVIE, {
        params: {
          query: query.trim(),
          page
        }
      });

      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to search movies: ${error.message}`);
    }
  }

  /**
   * Get trending movies
   */
  async getTrending(timeWindow = "day", page = 1) {
    try {
      const endpoint = timeWindow === "week" ? TMDB_ENDPOINTS.TRENDING_MOVIES_WEEK : TMDB_ENDPOINTS.TRENDING_MOVIES_DAY;

      const response = await tmdbClient.get(endpoint, {
        params: { page }
      });

      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch trending movies: ${error.message}`);
    }
  }

  /**
   * Discover movies with filters
   */
  async discoverMovies(filters = {}, page = 1) {
    try {
      const params = {
        page,
        ...filters
      };

      const response = await tmdbClient.get(TMDB_ENDPOINTS.DISCOVER_MOVIES, {
        params
      });

      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to discover movies: ${error.message}`);
    }
  }

  /**
   * Get similar movies
   */
  async getSimilarMovies(movieId, page = 1) {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.MOVIE_SIMILAR(movieId), {
        params: { page }
      });

      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch similar movies: ${error.message}`);
    }
  }

  /**
   * Get movie recommendations
   */
  async getRecommendations(movieId, page = 1) {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.MOVIE_RECOMMENDATIONS(movieId), {
        params: { page }
      });

      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch movie recommendations: ${error.message}`);
    }
  }
}

// Export singleton instance
export const movieApi = new MovieApiService();
export default movieApi;
```

### 4. Genre API Service (`src/features/movies/services/genreApi.js`)

```javascript
import { tmdbClient } from "@/shared/services/api/client";
import { TMDB_ENDPOINTS } from "@/shared/services/api/endpoints";

class GenreApiService {
  /**
   * Get all movie genres
   */
  async getMovieGenres() {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.MOVIE_GENRES);
      return response.data.genres;
    } catch (error) {
      throw new Error(`Failed to fetch movie genres: ${error.message}`);
    }
  }

  /**
   * Get movies by genre
   */
  async getMoviesByGenre(genreId, page = 1) {
    try {
      const response = await tmdbClient.get(TMDB_ENDPOINTS.DISCOVER_MOVIES, {
        params: {
          with_genres: genreId,
          page,
          sort_by: "popularity.desc"
        }
      });

      return {
        movies: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        currentPage: response.data.page
      };
    } catch (error) {
      throw new Error(`Failed to fetch movies by genre: ${error.message}`);
    }
  }
}

export const genreApi = new GenreApiService();
export default genreApi;
```

### 5. Feature Services Index (`src/features/movies/services/index.js`)

```javascript
// Clean exports for movie services
export { movieApi, default as movieApiService } from "./movieApi";
export { genreApi, default as genreApiService } from "./genreApi";

// Export all services as a convenient object
export const movieServices = {
  movieApi,
  genreApi
};
```

### 6. Authentication API (`src/features/auth/services/authApi.js`)

```javascript
import { appApiClient } from "@/shared/services/api/client";
import { APP_ENDPOINTS } from "@/shared/services/api/endpoints";

class AuthApiService {
  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await appApiClient.post(APP_ENDPOINTS.LOGIN, credentials);

      // Store auth token
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Register user
   */
  async register(userData) {
    try {
      const response = await appApiClient.post(APP_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw new Error(`Registration failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await appApiClient.post(APP_ENDPOINTS.LOGOUT);
      localStorage.removeItem("authToken");
    } catch (error) {
      // Even if API call fails, remove local token
      localStorage.removeItem("authToken");
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Refresh auth token
   */
  async refreshToken() {
    try {
      const response = await appApiClient.post(APP_ENDPOINTS.REFRESH_TOKEN);

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      return response.data;
    } catch (error) {
      localStorage.removeItem("authToken");
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
}

export const authApi = new AuthApiService();
export default authApi;
```

### 7. Shared Services Index (`src/shared/services/index.js`)

```javascript
// API clients
export { tmdbClient, appApiClient } from "./api/client";

// API endpoints
export { TMDB_ENDPOINTS, APP_ENDPOINTS } from "./api/endpoints";

// Utility functions for API
export const createImageUrl = (path, size = "w500") => {
  if (!path) return "/images/no-image-placeholder.jpg";
  return `${TMDB_ENDPOINTS.IMAGE_BASE_URL}${size}${path}`;
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    console.error(`API Error ${status}:`, data);
    return `Server error: ${data.message || "Something went wrong"}`;
  } else if (error.request) {
    // Network error
    console.error("Network Error:", error.request);
    return "Network error: Please check your internet connection";
  } else {
    // Other error
    console.error("Error:", error.message);
    return error.message;
  }
};
```

## 🎯 **Best Practices for API Services**

### 1. **Separation of Concerns**

- ✅ Keep API calls separate from business logic (Models)
- ✅ Keep API calls separate from UI logic (Views/Controllers)
- ✅ Use services only for data fetching and external communication

### 2. **Error Handling**

- ✅ Implement consistent error handling across all services
- ✅ Provide meaningful error messages
- ✅ Handle network errors gracefully

### 3. **Configuration**

- ✅ Use environment variables for API URLs and keys
- ✅ Centralize API configuration
- ✅ Use interceptors for common functionality

### 4. **Type Safety** (if using TypeScript)

```typescript
// Define API response types
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface MovieApiResponse {
  results: MovieData[];
  page: number;
  total_pages: number;
  total_results: number;
}
```

## ✅ **For Your Movie App Specifically**

Place your API files like this:

```
src/
├── features/
│   └── movies/
│       └── services/
│           ├── movieApi.js     ✅ TMDB movie API calls
│           ├── genreApi.js     ✅ TMDB genre API calls
│           └── index.js        ✅ Clean exports
├── shared/
│   └── services/
│       ├── api/
│       │   ├── client.js       ✅ Axios configuration
│       │   ├── endpoints.js    ✅ API endpoints
│       │   └── interceptors.js ✅ Request/response handling
│       └── index.js            ✅ Shared exports
└── app/
    └── services/
        ├── apiConfig.js        ✅ Global API config
        └── errorHandler.js     ✅ Global error handling
```

This structure keeps your API services organized, maintainable, and follows modern React architecture principles! 🚀
