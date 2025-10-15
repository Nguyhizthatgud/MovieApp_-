# Complete TMDB API Setup with Axios - Step by Step Guide

## 📋 Overview

This guide shows you how to set up a complete API service layer using Axios for React applications with The Movie Database (TMDB) API.

## 🚀 Step 1: Prerequisites

### 1.1 Get TMDB API Key

1. Go to [TMDB website](https://www.themoviedb.org/)
2. Create an account
3. Go to Settings → API
4. Generate an API key (Bearer Token)

### 1.2 Install Dependencies

```bash
npm install axios
```

## 🔧 Step 2: Environment Configuration

Create `.env` file in your project root:

```env
<!-- # TMDB API Configuration
VITE_TMDB_API_KEY=your_bearer_token_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p -->
```

## 📁 Step 3: Project Structure

```
src/
├── config/
│   └── api.js                 # Axios configuration
├── services/
│   └── movieService.js        # TMDB API services
├── components/
│   └── MovieApiExample.jsx    # Example component
└── Layout/
    └── MainLayout.jsx         # Updated layout
```

## ⚙️ Step 4: Axios Configuration

### 4.1 Create `src/config/api.js`

```javascript
import axios from "axios";

// Create axios instance with TMDB configuration
// const tmdbApi = axios.create({
//   baseURL: import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3",
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
//     Accept: "application/json"
//   }
// });

// Request interceptor
tmdbApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
tmdbApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received:`, response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.status, error.response?.statusText);

    // Handle common errors
    if (error.response?.status === 401) {
      console.error("🔑 Authentication failed - check your API key");
    } else if (error.response?.status === 404) {
      console.error("🔍 Resource not found");
    } else if (error.response?.status >= 500) {
      console.error("🔥 Server error occurred");
    }

    return Promise.reject(error);
  }
);

export default tmdbApi;
```

## 🎬 Step 5: Movie Service Layer

### 5.1 Key Features:

- ✅ Request/Response interceptors
- ✅ Error handling
- ✅ Request cancellation
- ✅ Parallel requests
- ✅ Image URL helpers
- ✅ Consistent response formatting

### 5.2 Available API Methods:

```javascript
// Basic movie fetching
movieService.getTrending(timeWindow); // 'day' or 'week'
movieService.getPopular(page);
movieService.getTopRated(page);

// Search and discovery
movieService.searchMovies(query, page, options);
movieService.getMoviesByGenre(genreId, page, sortBy);
movieService.discoverMovies(filters);

// Movie details
movieService.getMovieDetails(movieId);
movieService.getSimilarMovies(movieId, page);
movieService.getRecommendations(movieId, page);

// Utilities
movieService.getGenres();
createCancelToken();
```

### 5.3 Image Service:

```javascript
// Get properly formatted image URLs
imageService.getPosterUrl(posterPath, "w500");
imageService.getBackdropUrl(backdropPath, "w1280");
imageService.getProfileUrl(profilePath, "w185");

// Available sizes
imageService.posterSizes; // ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original']
imageService.backdropSizes; // ['w300', 'w780', 'w1280', 'original']
imageService.profileSizes; // ['w45', 'w185', 'h632', 'original']
```

## 🔍 Step 6: Usage Examples

### 6.1 Basic Component Usage

```javascript
import React, { useState, useEffect } from "react";
import { movieService, imageService } from "../services/movieService";

const MovieComponent = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await movieService.getPopular(1);
        setMovies(data.results);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {movies.map((movie) => (
        <div key={movie.id}>
          <img src={imageService.getPosterUrl(movie.poster_path, "w342")} alt={movie.title} />
          <h3>{movie.title}</h3>
          <p>Rating: {movie.vote_average}/10</p>
        </div>
      ))}
    </div>
  );
};
```

### 6.2 Search with Cancellation

```javascript
const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [cancelToken, setCancelToken] = useState(null);

  useEffect(() => {
    const searchMovies = async () => {
      // Cancel previous request
      if (cancelToken) {
        cancelToken.cancel("New search initiated");
      }

      if (query.length < 2) return;

      const newCancelToken = createCancelToken();
      setCancelToken(newCancelToken);

      try {
        const data = await movieService.searchMovies(query, 1, {
          cancelToken: newCancelToken.token
        });
        setResults(data.results);
      } catch (error) {
        if (!error.message.includes("cancelled")) {
          console.error("Search error:", error);
        }
      }
    };

    const debounceTimer = setTimeout(searchMovies, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search movies..." />;
};
```

### 6.3 Parallel Requests

```javascript
const MovieDetailsComponent = ({ movieId }) => {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch multiple endpoints simultaneously
        const [details, similar, recommendations] = await Promise.all([
          movieService.getMovieDetails(movieId),
          movieService.getSimilarMovies(movieId),
          movieService.getRecommendations(movieId)
        ]);

        setMovieData({
          details,
          similar: similar.results,
          recommendations: recommendations.results
        });
      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchAllData();
    }
  }, [movieId]);

  // Render component...
};
```

## 🛠️ Step 7: Advanced Patterns

### 7.1 Custom Hook for API Calls

```javascript
import { useState, useEffect, useCallback } from "react";
import { movieService } from "../services/movieService";

const useMovieData = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await movieService[endpoint](...Object.values(params));
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Usage
const { data: movies, loading, error } = useMovieData("getPopular", { page: 1 });
```

### 7.2 Error Boundary Integration

```javascript
import React from "react";

class MovieErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Movie API Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the movie data.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📊 Step 8: Best Practices

### 8.1 Security

- ✅ Store API keys in environment variables
- ✅ Never commit API keys to version control
- ✅ Use HTTPS for all requests
- ✅ Implement request rate limiting

### 8.2 Performance

- ✅ Use request cancellation for search
- ✅ Implement debouncing for user input
- ✅ Cache responses when appropriate
- ✅ Use parallel requests with Promise.all
- ✅ Optimize image sizes based on usage

### 8.3 Error Handling

- ✅ Implement global error handling
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging
- ✅ Handle network timeouts
- ✅ Implement retry logic for failed requests

### 8.4 Code Organization

- ✅ Separate API configuration from service logic
- ✅ Create reusable service functions
- ✅ Use consistent response formatting
- ✅ Implement proper TypeScript types (optional)

## 🔧 Step 9: Testing

### 9.1 Mock API Responses

```javascript
// __mocks__/movieService.js
export const movieService = {
  getPopular: jest.fn(() =>
    Promise.resolve({
      results: [{ id: 1, title: "Test Movie", vote_average: 8.5 }],
      total_pages: 1,
      page: 1
    })
  ),

  searchMovies: jest.fn(() =>
    Promise.resolve({
      results: [],
      total_pages: 0,
      page: 1
    })
  )
};
```

### 9.2 Component Testing

```javascript
import { render, screen, waitFor } from "@testing-library/react";
import { movieService } from "../services/movieService";
import MovieComponent from "../components/MovieComponent";

jest.mock("../services/movieService");

test("displays movies when API call succeeds", async () => {
  movieService.getPopular.mockResolvedValue({
    results: [{ id: 1, title: "Test Movie" }]
  });

  render(<MovieComponent />);

  await waitFor(() => {
    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });
});
```

## 🚀 Step 10: Next Steps

1. **Add TypeScript support** for better type safety
2. **Implement caching** with React Query or SWR
3. **Add pagination** for large data sets
4. **Implement offline support** with service workers
5. **Add more TMDB endpoints** (TV shows, people, etc.)
6. **Create custom hooks** for common patterns
7. **Add unit tests** for all service functions
8. **Implement lazy loading** for images

## 📚 Resources

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Query for Caching](https://tanstack.com/query/latest)
- [MSW for API Mocking](https://mswjs.io/)

---

This setup provides a robust, scalable API service layer for your React movie application! 🎬
