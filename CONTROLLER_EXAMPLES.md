# Controller Examples: The Coordination Layer

## 🎮 **What Controllers Actually Do**

Controllers are **coordinators** that handle:

- 🔄 **User Actions** → Convert UI events into business operations
- 📊 **Data Flow** → Orchestrate between models, services, and views
- ⚠️ **Error Handling** → Manage errors and user feedback
- 🔍 **Validation** → Coordinate input validation
- 🎯 **State Management** → Manage component state and side effects

## 📝 **Controller vs Other Layers**

```typescript
// ❌ NOT Controller Responsibility:
// - Direct API calls (that's Service layer)
// - Business rules (that's Model layer)
// - UI rendering (that's View layer)
// - Data transformation (that's Model layer)

// ✅ Controller Responsibility:
// - Coordinating between layers
// - Handling user interactions
// - Managing loading states
// - Error coordination
// - State orchestration
```

## 🎬 **Movie Controller Example**

### **Real-World Scenario: User searches for movies**

```typescript
// src/features/movies/controllers/MovieController.ts
import { useState, useCallback, useMemo } from "react";
import { Movie, SearchParams, MovieFilters } from "../models";
import { movieApiService } from "../services";
import { MovieValidator } from "../models/MovieValidator";

export class MovieController {
  constructor(private movieService: MovieApiService, private validator: MovieValidator) {}

  // 🎯 COORDINATION: Handle search workflow
  async searchMovies(searchParams: SearchParams): Promise<{
    movies: Movie[];
    totalResults: number;
    errors: string[];
  }> {
    // 1. VALIDATE INPUT (coordinate with validator)
    const validationResult = this.validator.validateSearchParams(searchParams);
    if (!validationResult.isValid) {
      return {
        movies: [],
        totalResults: 0,
        errors: validationResult.errors
      };
    }

    try {
      // 2. COORDINATE API CALL (delegate to service)
      const response = await this.movieService.searchMovies(searchParams);

      // 3. COORDINATE DATA PROCESSING (delegate to model)
      const processedMovies = response.results.map((movieData) => new Movie(movieData).sanitize());

      // 4. RETURN COORDINATED RESULT
      return {
        movies: processedMovies,
        totalResults: response.total_results,
        errors: []
      };
    } catch (error) {
      // 5. COORDINATE ERROR HANDLING
      return {
        movies: [],
        totalResults: 0,
        errors: [`Search failed: ${error.message}`]
      };
    }
  }

  // 🎯 COORDINATION: Handle movie selection
  async selectMovie(movieId: number): Promise<{
    movie: Movie | null;
    recommendations: Movie[];
    errors: string[];
  }> {
    try {
      // 1. COORDINATE PARALLEL DATA FETCHING
      const [movieDetails, recommendations] = await Promise.all([
        this.movieService.getMovieById(movieId),
        this.movieService.getRecommendations(movieId)
      ]);

      // 2. COORDINATE VALIDATION
      if (!movieDetails) {
        return {
          movie: null,
          recommendations: [],
          errors: ["Movie not found"]
        };
      }

      // 3. COORDINATE DATA TRANSFORMATION
      const movie = new Movie(movieDetails);
      const processedRecommendations = recommendations.map((rec) => new Movie(rec));

      return {
        movie,
        recommendations: processedRecommendations,
        errors: []
      };
    } catch (error) {
      return {
        movie: null,
        recommendations: [],
        errors: [`Failed to load movie: ${error.message}`]
      };
    }
  }

  // 🎯 COORDINATION: Handle filtering workflow
  applyFilters(movies: Movie[], filters: MovieFilters): Movie[] {
    // 1. VALIDATE FILTERS
    if (!filters || Object.keys(filters).length === 0) {
      return movies;
    }

    // 2. COORDINATE FILTERING (delegate to model methods)
    return movies.filter((movie) => {
      if (filters.minRating && !movie.meetsRatingCriteria(filters.minRating)) {
        return false;
      }

      if (filters.genre && !movie.hasGenre(filters.genre)) {
        return false;
      }

      if (filters.year && !movie.isFromYear(filters.year)) {
        return false;
      }

      return true;
    });
  }
}
```

### **React Hook Controller (State Management)**

```typescript
// src/features/movies/controllers/hooks/useMovieController.ts
export const useMovieController = () => {
  // 🎯 STATE COORDINATION
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🎯 CONTROLLER INSTANCE
  const movieController = useMemo(() => new MovieController(movieApiService, new MovieValidator()), []);

  // 🎯 COORDINATION: Handle search action
  const handleSearch = useCallback(
    async (query: string, page = 1) => {
      // 1. COORDINATE UI STATE
      setSearchLoading(true);
      setErrors([]);
      setSearchQuery(query);
      setCurrentPage(page);

      try {
        // 2. COORDINATE BUSINESS LOGIC
        const result = await movieController.searchMovies({
          query,
          page,
          includeAdult: false
        });

        // 3. COORDINATE STATE UPDATES
        if (result.errors.length > 0) {
          setErrors(result.errors);
          setMovies([]);
        } else {
          setMovies(result.movies);
          setErrors([]);
        }
      } catch (error) {
        // 4. COORDINATE ERROR STATE
        setErrors([`Search failed: ${error.message}`]);
        setMovies([]);
      } finally {
        // 5. COORDINATE LOADING STATE
        setSearchLoading(false);
      }
    },
    [movieController]
  );

  // 🎯 COORDINATION: Handle movie selection
  const handleMovieSelect = useCallback(
    async (movieId: number) => {
      setLoading(true);
      setErrors([]);

      try {
        // 1. COORDINATE MOVIE DETAILS LOADING
        const result = await movieController.selectMovie(movieId);

        if (result.errors.length > 0) {
          setErrors(result.errors);
        } else {
          setSelectedMovie(result.movie);
          setRecommendations(result.recommendations);
        }
      } catch (error) {
        setErrors([`Failed to select movie: ${error.message}`]);
      } finally {
        setLoading(false);
      }
    },
    [movieController]
  );

  // 🎯 COORDINATION: Handle filter application
  const handleApplyFilters = useCallback(
    (filters: MovieFilters) => {
      try {
        // 1. COORDINATE FILTERING
        const filteredMovies = movieController.applyFilters(movies, filters);

        // 2. COORDINATE STATE UPDATE
        setMovies(filteredMovies);
        setErrors([]);
      } catch (error) {
        setErrors([`Filter application failed: ${error.message}`]);
      }
    },
    [movieController, movies]
  );

  // 🎯 COORDINATION: Handle pagination
  const handlePageChange = useCallback(
    async (page: number) => {
      if (searchQuery) {
        await handleSearch(searchQuery, page);
      }
    },
    [searchQuery, handleSearch]
  );

  // 🎯 COORDINATION: Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 🎯 COORDINATION: Reset search
  const resetSearch = useCallback(() => {
    setMovies([]);
    setSelectedMovie(null);
    setRecommendations([]);
    setSearchQuery("");
    setCurrentPage(1);
    setErrors([]);
  }, []);

  // 🎯 PUBLIC API: What the view layer can access
  return {
    // State (read-only for views)
    movies,
    selectedMovie,
    recommendations,
    loading,
    searchLoading,
    errors,
    searchQuery,
    currentPage,

    // Actions (coordination methods)
    handleSearch,
    handleMovieSelect,
    handleApplyFilters,
    handlePageChange,
    clearErrors,
    resetSearch,

    // Computed values
    hasMovies: movies.length > 0,
    hasErrors: errors.length > 0,
    isSearching: searchLoading,
    isLoading: loading
  };
};
```

## 🔐 **Authentication Controller Example**

```typescript
// src/features/authentication/controllers/AuthController.ts
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private sessionManager: SessionManager
  ) {}

  // 🎯 COORDINATION: Handle login workflow
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    user: User | null;
    errors: string[];
    redirectTo?: string;
  }> {
    try {
      // 1. COORDINATE VALIDATION
      const validationResult = this.validateCredentials(credentials);
      if (!validationResult.isValid) {
        return {
          success: false,
          user: null,
          errors: validationResult.errors
        };
      }

      // 2. COORDINATE AUTHENTICATION
      const authResult = await this.authService.authenticate(credentials);

      if (!authResult.success) {
        return {
          success: false,
          user: null,
          errors: ["Invalid credentials"]
        };
      }

      // 3. COORDINATE SESSION CREATION
      await this.sessionManager.createSession(authResult.token);

      // 4. COORDINATE USER DATA LOADING
      const user = await this.userService.getCurrentUser();

      // 5. COORDINATE SUCCESS RESPONSE
      return {
        success: true,
        user,
        errors: [],
        redirectTo: user.role === "admin" ? "/admin" : "/dashboard"
      };
    } catch (error) {
      // 6. COORDINATE ERROR HANDLING
      return {
        success: false,
        user: null,
        errors: [`Login failed: ${error.message}`]
      };
    }
  }

  // 🎯 COORDINATION: Handle logout workflow
  async logout(): Promise<void> {
    try {
      // 1. COORDINATE SESSION CLEANUP
      await this.sessionManager.destroySession();

      // 2. COORDINATE SERVER LOGOUT
      await this.authService.logout();

      // 3. COORDINATE LOCAL CLEANUP
      this.clearUserData();
    } catch (error) {
      // Even if server logout fails, clean up locally
      this.sessionManager.destroySession();
      this.clearUserData();
    }
  }

  private validateCredentials(credentials: LoginCredentials) {
    // Coordinate validation logic
    const errors: string[] = [];

    if (!credentials.email) errors.push("Email is required");
    if (!credentials.password) errors.push("Password is required");
    if (credentials.email && !this.isValidEmail(credentials.email)) {
      errors.push("Invalid email format");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// React Hook for Auth
export const useAuthController = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const authController = useMemo(() => new AuthController(authService, userService, sessionManager), []);

  // 🎯 COORDINATION: Handle login action
  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setErrors([]);

      const result = await authController.login(credentials);

      if (result.success) {
        setUser(result.user);
        // Navigate to redirect URL
        if (result.redirectTo) {
          navigate(result.redirectTo);
        }
      } else {
        setErrors(result.errors);
      }

      setLoading(false);
    },
    [authController]
  );

  // 🎯 COORDINATION: Handle logout action
  const handleLogout = useCallback(async () => {
    setLoading(true);
    await authController.logout();
    setUser(null);
    setErrors([]);
    setLoading(false);
    navigate("/login");
  }, [authController]);

  return {
    user,
    loading,
    errors,
    handleLogin,
    handleLogout,
    isAuthenticated: !!user,
    isLoading: loading
  };
};
```

## 🛒 **E-commerce Controller Example**

```typescript
// src/features/cart/controllers/CartController.ts
export class CartController {
  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private inventoryService: InventoryService
  ) {}

  // 🎯 COORDINATION: Add item to cart workflow
  async addToCart(
    productId: number,
    quantity: number
  ): Promise<{
    success: boolean;
    cart: Cart | null;
    errors: string[];
  }> {
    try {
      // 1. COORDINATE VALIDATION
      if (quantity <= 0) {
        return {
          success: false,
          cart: null,
          errors: ["Quantity must be greater than 0"]
        };
      }

      // 2. COORDINATE INVENTORY CHECK
      const availability = await this.inventoryService.checkAvailability(productId, quantity);

      if (!availability.available) {
        return {
          success: false,
          cart: null,
          errors: [`Only ${availability.stock} items available`]
        };
      }

      // 3. COORDINATE PRODUCT DETAILS
      const product = await this.productService.getById(productId);
      if (!product) {
        return {
          success: false,
          cart: null,
          errors: ["Product not found"]
        };
      }

      // 4. COORDINATE CART UPDATE
      const updatedCart = await this.cartService.addItem({
        productId,
        quantity,
        price: product.price
      });

      // 5. COORDINATE SUCCESS RESPONSE
      return {
        success: true,
        cart: updatedCart,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        cart: null,
        errors: [`Failed to add to cart: ${error.message}`]
      };
    }
  }

  // 🎯 COORDINATION: Checkout workflow
  async checkout(paymentInfo: PaymentInfo): Promise<{
    success: boolean;
    orderId: string | null;
    errors: string[];
  }> {
    try {
      // 1. COORDINATE CART VALIDATION
      const cart = await this.cartService.getCurrentCart();
      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          orderId: null,
          errors: ["Cart is empty"]
        };
      }

      // 2. COORDINATE INVENTORY VERIFICATION
      for (const item of cart.items) {
        const available = await this.inventoryService.checkAvailability(item.productId, item.quantity);

        if (!available.available) {
          return {
            success: false,
            orderId: null,
            errors: [`${item.product.name} is no longer available`]
          };
        }
      }

      // 3. COORDINATE PAYMENT PROCESSING
      const paymentResult = await this.paymentService.processPayment({
        amount: cart.total,
        paymentInfo
      });

      if (!paymentResult.success) {
        return {
          success: false,
          orderId: null,
          errors: ["Payment failed"]
        };
      }

      // 4. COORDINATE ORDER CREATION
      const order = await this.orderService.createOrder({
        cartId: cart.id,
        paymentId: paymentResult.paymentId
      });

      // 5. COORDINATE INVENTORY UPDATE
      await this.inventoryService.reserveItems(cart.items);

      // 6. COORDINATE CART CLEANUP
      await this.cartService.clearCart();

      return {
        success: true,
        orderId: order.id,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        orderId: null,
        errors: [`Checkout failed: ${error.message}`]
      };
    }
  }
}
```

## 🎯 **Key Controller Patterns**

### **1. Input Coordination**

```typescript
// Controller coordinates input validation
async handleUserInput(input: UserInput) {
  // 1. Coordinate validation
  const validation = await this.validator.validate(input);
  if (!validation.isValid) {
    return { errors: validation.errors };
  }

  // 2. Coordinate business logic
  const result = await this.service.process(input);

  // 3. Coordinate response
  return { data: result, errors: [] };
}
```

### **2. State Orchestration**

```typescript
// Controller orchestrates complex state changes
async handleComplexAction() {
  try {
    setLoading(true);
    setErrors([]);

    // Coordinate multiple operations
    const results = await Promise.all([
      this.serviceA.doSomething(),
      this.serviceB.doSomethingElse(),
      this.serviceC.doAnotherThing()
    ]);

    // Coordinate state updates
    updateStateFromResults(results);

  } catch (error) {
    setErrors([error.message]);
  } finally {
    setLoading(false);
  }
}
```

### **3. Error Coordination**

```typescript
// Controller coordinates error handling across layers
async handleWithErrorRecovery() {
  try {
    return await this.primaryService.execute();
  } catch (primaryError) {

    // Coordinate fallback strategy
    try {
      return await this.fallbackService.execute();
    } catch (fallbackError) {

      // Coordinate error reporting
      this.errorReporter.report({
        primary: primaryError,
        fallback: fallbackError
      });

      throw new Error('All strategies failed');
    }
  }
}
```

## 📊 **Controller Benefits**

1. **🎯 Single Responsibility**: Each controller handles one domain's coordination
2. **🔄 Testable**: Easy to test coordination logic with mocked dependencies
3. **📱 Reusable**: Same controller can be used across different UI components
4. **🛡️ Error Handling**: Centralized error coordination and recovery
5. **🎭 State Management**: Clean separation of UI state from business logic

## ✅ **Controller Checklist**

Controllers should:

- ✅ **Coordinate** between layers (models, services, views)
- ✅ **Handle** user actions and convert them to business operations
- ✅ **Manage** loading states, errors, and user feedback
- ✅ **Orchestrate** complex workflows with multiple steps
- ✅ **Validate** inputs and coordinate validation results

Controllers should NOT:

- ❌ **Contain** business logic (that's models)
- ❌ **Make** direct UI decisions (that's views)
- ❌ **Perform** data transformations (that's models)
- ❌ **Handle** HTTP details (that's services)
- ❌ **Store** persistent data (that's repositories)

Controllers are the **conductors** of your application orchestra! 🎼
