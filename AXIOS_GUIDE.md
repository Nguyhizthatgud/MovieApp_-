# Axios Complete Guide

## What is Axios?

Axios is a popular JavaScript library for making HTTP requests. It's promise-based and works in both browsers and Node.js.

## Why Choose Axios over Fetch API?

| Feature                         | Axios                  | Fetch                          |
| ------------------------------- | ---------------------- | ------------------------------ |
| JSON Parsing                    | Automatic              | Manual (.json())               |
| Error Handling                  | Throws for HTTP errors | Only throws for network errors |
| Request/Response Interceptors   | ✅ Built-in            | ❌ Manual implementation       |
| Request Timeout                 | ✅ Built-in            | ❌ Manual with AbortController |
| Request Cancellation            | ✅ Built-in            | ✅ AbortController             |
| Browser Support                 | ✅ Older browsers      | ❌ Modern browsers only        |
| Request/Response Transformation | ✅ Built-in            | ❌ Manual                      |

## Installation

```bash
npm install axios
```

## Basic Usage Examples

### 1. Simple GET Request

```javascript
import axios from "axios";

// Basic GET request
const response = await axios.get("https://api.example.com/data");
console.log(response.data);

// With config object
const response = await axios({
  method: "GET",
  url: "https://api.example.com/data",
  headers: {
    Authorization: "Bearer token"
  }
});
```

### 2. POST Request

```javascript
// Simple POST
const data = { name: "John", email: "john@example.com" };
const response = await axios.post("https://api.example.com/users", data);

// With headers
const response = await axios.post("https://api.example.com/users", data, {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer token"
  }
});
```

### 3. Other HTTP Methods

```javascript
// PUT request
await axios.put("https://api.example.com/users/1", updateData);

// PATCH request
await axios.patch("https://api.example.com/users/1", partialData);

// DELETE request
await axios.delete("https://api.example.com/users/1");
```

## Advanced Features

### 1. Creating Axios Instance

```javascript
const apiClient = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
  headers: {
    Authorization: "Bearer token",
    "Content-Type": "application/json"
  }
});

// Use the instance
const response = await apiClient.get("/users");
```

### 2. Request & Response Interceptors

```javascript
// Request interceptor - modify requests before sending
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    config.headers.Authorization = `Bearer ${getToken()}`;
    // Log request
    console.log("🚀 Request:", config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle responses globally
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status);
    return response;
  },
  (error) => {
    // Global error handling
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 3. Error Handling

```javascript
try {
  const response = await axios.get("/api/data");
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error status (4xx, 5xx)
    console.error("Response Error:", error.response.status, error.response.data);
  } else if (error.request) {
    // Request was made but no response received
    console.error("Network Error:", error.request);
  } else {
    // Something else happened
    console.error("Error:", error.message);
  }
  throw error;
}
```

### 4. Request Cancellation

```javascript
import axios from "axios";

// Create cancel token
const cancelToken = axios.CancelToken.source();

// Make request with cancel token
try {
  const response = await axios.get("/api/data", {
    cancelToken: cancelToken.token
  });
} catch (error) {
  if (axios.isCancel(error)) {
    console.log("Request cancelled");
  }
}

// Cancel the request
cancelToken.cancel("Operation cancelled by user");
```

### 5. Parallel Requests

```javascript
// Execute multiple requests simultaneously
const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
  axios.get("/api/users"),
  axios.get("/api/posts"),
  axios.get("/api/comments")
]);

// Process results
const users = usersResponse.data;
const posts = postsResponse.data;
const comments = commentsResponse.data;
```

### 6. Request Timeout

```javascript
// Global timeout
const apiClient = axios.create({
  timeout: 5000 // 5 seconds
});

// Per-request timeout
const response = await axios.get("/api/data", {
  timeout: 10000 // 10 seconds
});
```

## React Integration Patterns

### 1. Basic Hook Usage

```javascript
import { useState, useEffect } from "react";
import axios from "axios";

const useApiData = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error };
};
```

### 2. Custom Hook with Cancellation

```javascript
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (config) => {
    const cancelToken = axios.CancelToken.source();
    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        ...config,
        cancelToken: cancelToken.token
      });
      return response.data;
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }

    // Return cancel function
    return () => cancelToken.cancel();
  }, []);

  return { makeRequest, loading, error };
};
```

## Best Practices

### 1. Environment Configuration

```javascript
// Create different instances for different environments
const createApiClient = (baseURL) => {
  return axios.create({
    baseURL,
    timeout: process.env.NODE_ENV === "development" ? 30000 : 10000,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const apiClient = createApiClient(
  process.env.NODE_ENV === "production" ? "https://api.production.com" : "https://api.development.com"
);
```

### 2. Response Data Transformation

```javascript
const apiClient = axios.create({
  baseURL: "https://api.example.com",
  transformResponse: [
    (data) => {
      // Transform response data
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        timestamp: new Date().toISOString()
      };
    }
  ]
});
```

### 3. Retry Logic

```javascript
const apiClientWithRetry = axios.create();

apiClientWithRetry.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;

    if (!config.retry) config.retry = 0;

    if (config.retry < 3 && error.response?.status >= 500) {
      config.retry++;
      await new Promise((resolve) => setTimeout(resolve, 1000 * config.retry));
      return apiClientWithRetry(config);
    }

    return Promise.reject(error);
  }
);
```

## Common Patterns in Your Movie App

### 1. Movie Service Pattern

```javascript
// services/movieService.js
export const movieService = {
  getTrending: (timeWindow = "day") => apiClient.get(`/trending/movie/${timeWindow}`),
  getPopular: (page = 1) => apiClient.get("/movie/popular", { params: { page } }),
  searchMovies: (query) => apiClient.get("/search/movie", { params: { query } }),
  getMovieDetails: (id) => apiClient.get(`/movie/${id}`)
};
```

### 2. React Component Usage

```javascript
// components/MovieList.jsx
const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const { data } = await movieService.getPopular();
        setMovies(data.results);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
```

## Debugging Tips

1. **Use interceptors for logging**
2. **Check network tab in DevTools**
3. **Validate request/response data**
4. **Handle different error types**
5. **Use proper timeout values**
6. **Implement loading states**
7. **Cancel requests when components unmount**

This guide covers the most important Axios concepts and patterns for your React movie application!
