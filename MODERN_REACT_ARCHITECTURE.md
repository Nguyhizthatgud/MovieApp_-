# Modern React Application Architecture Guide

## 1. Feature-Based Architecture (Best Practice)

### Current Structure (Type-Based - Not Recommended)

```
src/
├── components/     # All components mixed together
├── services/       # All services mixed together
├── utils/          # All utilities mixed together
└── styles/         # All styles mixed together
```

### Recommended Modern Structure (Feature-Based)

```
src/
├── app/                    # App configuration
│   ├── store/             # Global state management
│   ├── router/            # Routing configuration
│   └── providers/         # Context providers
├── shared/                # Shared across features
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Basic UI (Button, Input, Modal)
│   │   ├── layout/       # Layout components
│   │   └── forms/        # Form components
│   ├── hooks/            # Custom hooks
│   ├── services/         # External services (API, auth)
│   ├── utils/            # Helper functions
│   ├── constants/        # App constants
│   └── types/            # TypeScript types
├── features/             # Feature modules
│   ├── auth/
│   │   ├── components/   # Auth-specific components
│   │   ├── hooks/        # Auth-specific hooks
│   │   ├── services/     # Auth API calls
│   │   ├── types/        # Auth types
│   │   └── index.ts      # Public API
│   ├── movies/
│   │   ├── components/
│   │   │   ├── MovieCard/
│   │   │   ├── MovieList/
│   │   │   ├── MovieSearch/
│   │   │   └── MovieDetails/
│   │   ├── hooks/
│   │   │   ├── useMovies.ts
│   │   │   ├── useMovieSearch.ts
│   │   │   └── useMovieDetails.ts
│   │   ├── services/
│   │   │   └── movieApi.ts
│   │   ├── types/
│   │   │   └── movie.types.ts
│   │   └── index.ts
│   └── dashboard/
└── pages/               # Page components (Next.js style)
    ├── HomePage/
    ├── MoviesPage/
    └── AuthPage/
```

## 2. Modern Architecture Patterns

### A. Component Architecture

#### 1. Compound Components Pattern

```typescript
// Instead of prop drilling
<MovieCard
  title={movie.title}
  image={movie.poster}
  rating={movie.rating}
  description={movie.overview}
/>

// Use compound components
<MovieCard movie={movie}>
  <MovieCard.Image />
  <MovieCard.Header>
    <MovieCard.Title />
    <MovieCard.Rating />
  </MovieCard.Header>
  <MovieCard.Body>
    <MovieCard.Description />
  </MovieCard.Body>
</MovieCard>
```

#### 2. Container/Presenter Pattern

```typescript
// Container (Logic)
const MovieListContainer = () => {
  const { movies, loading, error } = useMovies();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <MovieListPresenter movies={movies} />;
};

// Presenter (UI Only)
const MovieListPresenter = ({ movies }) => (
  <div className="movie-grid">
    {movies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} />
    ))}
  </div>
);
```

### B. Custom Hooks Pattern

#### 1. Data Fetching Hooks

```typescript
// features/movies/hooks/useMovies.ts
export const useMovies = (category: string) => {
  const [state, setState] = useState({
    movies: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    const fetchMovies = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const movies = await movieApi.getByCategory(category);
        setState({ movies, loading: false, error: null });
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false, error }));
      }
    };

    fetchMovies();
  }, [category]);

  return state;
};
```

#### 2. Search Hook with Debouncing

```typescript
// features/movies/hooks/useMovieSearch.ts
export const useMovieSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      searchMovies(debouncedQuery);
    }
  }, [debouncedQuery]);

  const searchMovies = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await movieApi.search(searchQuery);
      setResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return { query, setQuery, results, loading };
};
```

### C. Service Layer Architecture

#### 1. API Client Setup

```typescript
// shared/services/api/client.ts
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle auth errors
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }
}
```

#### 2. Feature-Specific Services

```typescript
// features/movies/services/movieApi.ts
class MovieApiService {
  constructor(private apiClient: ApiClient) {}

  async getPopular(page = 1): Promise<MovieResponse> {
    return this.apiClient.get(`/movie/popular?page=${page}`);
  }

  async getTrending(timeWindow = "day"): Promise<MovieResponse> {
    return this.apiClient.get(`/trending/movie/${timeWindow}`);
  }

  async search(query: string, page = 1): Promise<MovieResponse> {
    return this.apiClient.get(`/search/movie`, {
      params: { query, page }
    });
  }

  async getDetails(id: number): Promise<Movie> {
    return this.apiClient.get(`/movie/${id}`);
  }
}

export const movieApi = new MovieApiService(apiClient);
```

### D. State Management Architecture

#### 1. Zustand (Recommended for small-medium apps)

```typescript
// features/movies/store/movieStore.ts
interface MovieStore {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  fetchMovies: (category: string) => Promise<void>;
  searchMovies: (query: string) => Promise<void>;
}

export const useMovieStore = create<MovieStore>((set, get) => ({
  movies: [],
  loading: false,
  error: null,

  fetchMovies: async (category) => {
    set({ loading: true, error: null });
    try {
      const movies = await movieApi.getByCategory(category);
      set({ movies, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  searchMovies: async (query) => {
    set({ loading: true, error: null });
    try {
      const movies = await movieApi.search(query);
      set({ movies, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

#### 2. React Query (Recommended for data fetching)

```typescript
// features/movies/hooks/useMoviesQuery.ts
export const useMoviesQuery = (category: string) => {
  return useQuery({
    queryKey: ["movies", category],
    queryFn: () => movieApi.getByCategory(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useMovieSearchQuery = (query: string) => {
  return useQuery({
    queryKey: ["movies", "search", query],
    queryFn: () => movieApi.search(query),
    enabled: !!query && query.length >= 2
  });
};
```

## 3. Modern React Patterns

### A. Composition over Inheritance

```typescript
// Bad: Large monolithic component
const MoviePage = () => {
  // 200+ lines of mixed logic and UI
};

// Good: Composed smaller components
const MoviePage = () => (
  <PageLayout>
    <MovieFilters />
    <MovieList />
    <MoviePagination />
  </PageLayout>
);
```

### B. Higher-Order Components (HOCs) vs Custom Hooks

```typescript
// Old: HOC pattern
const withAuth = (Component) => {
  return (props) => {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} />;
  };
};

// Modern: Custom hook pattern
const useAuthGuard = () => {
  const { user, loading } = useAuth();

  if (loading) return { status: "loading" };
  if (!user) return { status: "unauthenticated" };
  return { status: "authenticated", user };
};

const ProtectedPage = () => {
  const auth = useAuthGuard();

  if (auth.status === "loading") return <Loading />;
  if (auth.status === "unauthenticated") return <Redirect to="/login" />;

  return <PageContent user={auth.user} />;
};
```

### C. Error Boundaries

```typescript
// shared/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MoviePage />
</ErrorBoundary>;
```

## 4. File Naming Conventions

### Component Files

```
PascalCase for components:
- MovieCard.tsx
- MovieList.tsx
- SearchForm.tsx

kebab-case for utilities:
- api-client.ts
- date-utils.ts
- format-helpers.ts

camelCase for hooks:
- useMovies.ts
- useAuth.ts
- useLocalStorage.ts
```

### Index Files for Clean Imports

```typescript
// features/movies/index.ts
export { MovieCard } from "./components/MovieCard";
export { MovieList } from "./components/MovieList";
export { useMovies } from "./hooks/useMovies";
export { movieApi } from "./services/movieApi";

// Usage
import { MovieCard, MovieList, useMovies } from "@/features/movies";
```

## 5. Modern Testing Architecture

### Component Testing

```typescript
// features/movies/components/MovieCard/MovieCard.test.tsx
describe("MovieCard", () => {
  it("displays movie information correctly", () => {
    const movie = createMockMovie();
    render(<MovieCard movie={movie} />);

    expect(screen.getByText(movie.title)).toBeInTheDocument();
    expect(screen.getByText(movie.rating)).toBeInTheDocument();
  });

  it("handles click events", () => {
    const onClick = jest.fn();
    const movie = createMockMovie();

    render(<MovieCard movie={movie} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledWith(movie.id);
  });
});
```

### Hook Testing

```typescript
// features/movies/hooks/useMovies.test.ts
describe("useMovies", () => {
  it("fetches movies successfully", async () => {
    const { result } = renderHook(() => useMovies("popular"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.movies).toHaveLength(20);
    });
  });
});
```

## 6. Performance Optimization

### Code Splitting

```typescript
// Lazy loading feature modules
const MoviesPage = lazy(() => import("@/features/movies/pages/MoviesPage"));
const AuthPage = lazy(() => import("@/features/auth/pages/AuthPage"));

// Route-based splitting
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/movies" element={<MoviesPage />} />
    <Route path="/auth" element={<AuthPage />} />
  </Routes>
</Suspense>;
```

### Memoization

```typescript
// Memoize expensive computations
const MovieList = ({ movies, filters }) => {
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => movie.genre.includes(filters.genre) && movie.rating >= filters.minRating);
  }, [movies, filters]);

  return (
    <div>
      {filteredMovies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
```

This modern architecture provides:

- 🏗️ **Scalability**: Easy to add new features
- 🔧 **Maintainability**: Clear separation of concerns
- 🧪 **Testability**: Isolated, testable units
- 🚀 **Performance**: Optimized loading and rendering
- 🔄 **Reusability**: Shared components and hooks
- 📦 **Type Safety**: Full TypeScript support
