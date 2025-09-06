# Merging MVC with Feature-Based Architecture

## 🎯 **Hybrid Architecture: Feature-Based + MVC**

### **Philosophy:**

- **Feature-Based** provides domain separation (horizontal scaling)
- **MVC** provides layered separation within each feature (vertical scaling)
- Each feature is self-contained with its own MVC structure

## 🏗️ **Architecture Structure**

```
src/
├── features/                           # 📦 FEATURE-BASED ORGANIZATION
│   ├── movies/                        # 🎬 Movie Domain Feature
│   │   ├── models/                    # 📊 MVC: MODEL LAYER
│   │   │   ├── Movie.ts               # Movie entity
│   │   │   ├── MovieRepository.ts     # Data access
│   │   │   ├── MovieValidator.ts      # Business rules
│   │   │   └── index.ts
│   │   ├── views/                     # 🎨 MVC: VIEW LAYER
│   │   │   ├── components/            # Reusable UI components
│   │   │   │   ├── MovieCard/
│   │   │   │   ├── MovieList/
│   │   │   │   └── MovieFilter/
│   │   │   ├── pages/                 # Page-level views
│   │   │   │   ├── MoviesHomePage/
│   │   │   │   ├── MovieDetailPage/
│   │   │   │   └── SearchResultsPage/
│   │   │   └── index.ts
│   │   ├── controllers/               # 🎮 MVC: CONTROLLER LAYER
│   │   │   ├── MovieController.ts     # Main movie logic
│   │   │   ├── SearchController.ts    # Search coordination
│   │   │   ├── FilterController.ts    # Filter logic
│   │   │   └── index.ts
│   │   ├── services/                  # 🔌 External integrations
│   │   │   ├── movieApi.ts
│   │   │   ├── movieCache.ts
│   │   │   └── index.ts
│   │   └── index.ts                   # Feature public API
│   ├── authentication/               # 🔐 Auth Domain Feature
│   │   ├── models/                   # User, Session, Token models
│   │   ├── views/                    # Login, Register components
│   │   ├── controllers/              # Auth logic coordination
│   │   └── services/                 # Auth API, JWT handling
│   └── users/                        # 👤 User Domain Feature
│       ├── models/                   # User profile, preferences
│       ├── views/                    # Profile, settings views
│       ├── controllers/              # User management logic
│       └── services/                 # User API operations
├── shared/                           # 🔄 Shared across features
│   ├── models/                       # Base models, interfaces
│   ├── views/                        # Generic UI components
│   ├── services/                     # HTTP client, utilities
│   └── utils/                        # Helper functions
├── app/                             # 🏗️ App-level infrastructure
│   ├── config/                      # Environment, constants
│   ├── providers/                   # React context providers
│   ├── layout/                      # App-level layouts
│   └── routing/                     # Route definitions
└── pages/                           # 🗂️ Next.js pages (if using)
```

## 📊 **Layer Responsibilities**

### **Model Layer (Data & Business Logic)**

```typescript
// features/movies/models/Movie.ts
export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  rating: number;
}

export class MovieModel {
  constructor(private data: Movie) {}

  // Business logic methods
  isHighRated(): boolean {
    return this.data.rating >= 8.0;
  }

  getDisplayTitle(): string {
    return `${this.data.title} (${this.data.year})`;
  }

  // Validation methods
  validate(): ValidationResult {
    // Business rules validation
  }
}

// features/movies/models/MovieRepository.ts
export class MovieRepository {
  async getMovies(filters: MovieFilters): Promise<Movie[]> {
    // Data access logic
  }

  async getMovie(id: number): Promise<Movie | null> {
    // Single movie retrieval
  }

  async saveMovie(movie: Movie): Promise<Movie> {
    // Save/update movie
  }
}
```

### **View Layer (UI Components)**

```typescript
// features/movies/views/components/MovieCard/MovieCard.tsx
interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  const movieModel = new MovieModel(movie);

  return (
    <Card onClick={() => onSelect(movie)} className={movieModel.isHighRated() ? "high-rated" : ""}>
      <h3>{movieModel.getDisplayTitle()}</h3>
      <p>Rating: {movie.rating}</p>
    </Card>
  );
};

// features/movies/views/pages/MoviesHomePage/MoviesHomePage.tsx
export const MoviesHomePage: React.FC = () => {
  const movieController = useMovieController();

  return (
    <div>
      <MovieFilter onFilter={movieController.handleFilter} />
      <MovieList
        movies={movieController.movies}
        loading={movieController.loading}
        onMovieSelect={movieController.handleMovieSelect}
      />
    </div>
  );
};
```

### **Controller Layer (Logic Coordination)**

```typescript
// features/movies/controllers/MovieController.ts
export class MovieController {
  constructor(private movieRepository: MovieRepository, private movieApi: MovieApiService) {}

  async loadMovies(filters: MovieFilters): Promise<Movie[]> {
    try {
      // Coordinate between model and service layers
      const movies = await this.movieRepository.getMovies(filters);
      return movies.map((movie) => new MovieModel(movie));
    } catch (error) {
      // Error handling logic
      throw new Error(`Failed to load movies: ${error.message}`);
    }
  }

  async searchMovies(query: string): Promise<Movie[]> {
    // Search coordination logic
    const results = await this.movieApi.search(query);
    return results.filter((movie) => {
      const movieModel = new MovieModel(movie);
      return movieModel.validate().isValid;
    });
  }
}

// features/movies/controllers/hooks/useMovieController.ts
export const useMovieController = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const movieController = useMemo(() => new MovieController(new MovieRepository(), movieApiService), []);

  const handleFilter = useCallback(
    async (filters: MovieFilters) => {
      setLoading(true);
      try {
        const filteredMovies = await movieController.loadMovies(filters);
        setMovies(filteredMovies);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    },
    [movieController]
  );

  const handleMovieSelect = useCallback((movie: Movie) => {
    // Navigation or state update logic
    navigate(`/movies/${movie.id}`);
  }, []);

  return {
    movies,
    loading,
    handleFilter,
    handleMovieSelect,
    controller: movieController
  };
};
```

## 🔄 **Communication Between Features**

### **1. Shared Interfaces**

```typescript
// shared/models/interfaces.ts
export interface BaseRepository<T> {
  getById(id: number): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: number): Promise<void>;
}

export interface BaseController {
  handleError(error: Error): void;
  validateInput(input: unknown): ValidationResult;
}
```

### **2. Feature Integration**

```typescript
// features/movies/controllers/MovieController.ts
import { UserPreferences } from "../../../users/models";
import { AuthController } from "../../../authentication/controllers";

export class MovieController {
  constructor(
    private authController: AuthController, // Cross-feature dependency
    private movieRepository: MovieRepository
  ) {}

  async getRecommendedMovies(): Promise<Movie[]> {
    // Use auth controller to get user preferences
    const user = await this.authController.getCurrentUser();
    const preferences = user?.preferences;

    return this.movieRepository.getMoviesByPreferences(preferences);
  }
}
```

### **3. Event-Driven Communication**

```typescript
// shared/services/EventBus.ts
export class EventBus {
  private events: Map<string, Function[]> = new Map();

  emit(event: string, data: any): void {
    const handlers = this.events.get(event) || [];
    handlers.forEach((handler) => handler(data));
  }

  on(event: string, handler: Function): void {
    const handlers = this.events.get(event) || [];
    this.events.set(event, [...handlers, handler]);
  }
}

// features/movies/controllers/MovieController.ts
export class MovieController {
  constructor(private eventBus: EventBus) {
    // Listen to user events
    this.eventBus.on("user:preferencesChanged", this.updateRecommendations);
  }

  private updateRecommendations = (preferences: UserPreferences) => {
    // Update movie recommendations based on user preference changes
  };
}
```

## 🎯 **Benefits of Hybrid Approach**

### **1. Best of Both Worlds**

- ✅ **Domain separation** from Feature-Based Architecture
- ✅ **Clear layer separation** from MVC pattern
- ✅ **Scalable horizontally** (new features) and **vertically** (complex features)

### **2. Team Organization**

```
Movie Team:
├── Frontend Dev → views/ (React components)
├── Backend Dev → models/ + services/ (API integration)
├── Logic Dev → controllers/ (Business logic coordination)
└── QA → Testing each layer independently

Auth Team:
├── Security Expert → models/ + controllers/ (Auth logic)
├── UI/UX → views/ (Login/Register components)
└── DevOps → services/ (JWT, OAuth integration)
```

### **3. Testing Strategy**

```typescript
// Test each layer independently
describe("MovieModel", () => {
  it("validates business rules", () => {
    // Test model logic only
  });
});

describe("MovieController", () => {
  it("coordinates data flow", () => {
    // Test controller coordination with mocked dependencies
  });
});

describe("MovieCard", () => {
  it("renders movie data", () => {
    // Test view rendering only
  });
});

// Integration tests
describe("Movies Feature", () => {
  it("handles complete user workflow", () => {
    // Test entire feature flow
  });
});
```

## 🚀 **Migration Strategy**

### **Phase 1: Restructure by Features**

1. Move existing code into feature folders
2. Identify domain boundaries
3. Create feature index files

### **Phase 2: Apply MVC Within Features**

1. Extract business logic → models/
2. Separate UI components → views/
3. Create coordination layer → controllers/

### **Phase 3: Optimize Communication**

1. Define feature interfaces
2. Implement event bus for cross-feature communication
3. Add shared utilities

### **Phase 4: Enhance with Patterns**

1. Add repository pattern for data access
2. Implement command/query separation
3. Add validation and error handling layers

## ✅ **Result: Scalable, Maintainable Architecture**

This hybrid approach gives you:

- 🏗️ **Clear structure** with both domain and layer separation
- 🔄 **Easy testing** with isolated, focused layers
- 👥 **Team-friendly** organization
- 📈 **Scalable** both horizontally (new features) and vertically (complex logic)
- 🛠️ **Maintainable** code with clear responsibilities
- 🔌 **Flexible** integration between features

The key is **MVC within each feature** rather than MVC across the entire application!
