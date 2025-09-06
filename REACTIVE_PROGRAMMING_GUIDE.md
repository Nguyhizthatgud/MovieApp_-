# Reactive Programming in React Applications

## 🔄 **What is Reactive Programming?**

Reactive Programming is a paradigm focused on:

- 📡 **Data Streams**: Treating data as streams that emit values over time
- ⚡ **Automatic Reactions**: Systems that automatically respond to changes
- 🔗 **Declarative**: Describing what should happen, not how
- 🌊 **Asynchronous**: Handling async operations gracefully
- 🔄 **Propagation**: Changes automatically flow through the system

## 🎯 **Core Reactive Concepts**

### **1. Observables**

Streams of data that emit values over time

### **2. Observers**

Functions that react to emitted values

### **3. Operators**

Functions that transform, filter, or combine streams

### **4. Subscriptions**

Connections between observables and observers

## 🎬 **Reactive Programming in Your Movie App**

### **Traditional Approach (Imperative)**

```javascript
// ❌ Imperative - manually managing state and side effects
class MovieController {
  constructor() {
    this.movies = [];
    this.loading = false;
    this.error = null;
    this.searchQuery = "";
    this.filters = {};
  }

  async fetchMovies() {
    this.loading = true;
    try {
      const response = await movieApi.getPopular();
      this.movies = response.movies;
      this.loading = false;
    } catch (error) {
      this.error = error.message;
      this.loading = false;
    }
  }

  async searchMovies(query) {
    this.searchQuery = query;
    this.loading = true;
    try {
      const response = await movieApi.search(query);
      this.movies = response.movies;
      this.loading = false;
    } catch (error) {
      this.error = error.message;
      this.loading = false;
    }
  }
}
```

### **Reactive Approach (Declarative)**

```javascript
// ✅ Reactive - automatic reactions to changes
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  startWith
} from "rxjs";
import { movieApi } from "../services/movieApi";

class ReactiveMovieController {
  constructor() {
    // Reactive streams
    this.searchQuery$ = new BehaviorSubject("");
    this.filters$ = new BehaviorSubject({});
    this.refreshTrigger$ = new BehaviorSubject(null);

    // Derived streams
    this.movieRequest$ = combineLatest([
      this.searchQuery$.pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged() // Only emit when value actually changes
      ),
      this.filters$,
      this.refreshTrigger$
    ]);

    // Main movie stream
    this.movies$ = this.movieRequest$.pipe(
      switchMap(([query, filters]) => {
        if (query.trim()) {
          return movieApi.search(query, filters);
        } else {
          return movieApi.getPopular(filters);
        }
      }),
      catchError((error) => ({
        movies: [],
        error: error.message,
        loading: false
      })),
      startWith({ movies: [], loading: true, error: null })
    );

    // Loading stream
    this.loading$ = this.movieRequest$.pipe(
      switchMap(() =>
        this.movies$.pipe(
          map((result) => result.loading ?? false),
          startWith(true)
        )
      )
    );
  }

  // Simple actions that trigger reactive chains
  setSearchQuery(query) {
    this.searchQuery$.next(query);
  }

  setFilters(filters) {
    this.filters$.next(filters);
  }

  refresh() {
    this.refreshTrigger$.next(Date.now());
  }
}
```

## 🛠️ **Implementing Reactive Patterns in React**

### **1. Reactive Hook with RxJS**

```javascript
// src/shared/hooks/useReactiveMovie.js
import { useState, useEffect, useMemo } from "react";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  startWith,
  map
} from "rxjs";
import { movieApi } from "@/features/movies/services/movieApi";

export const useReactiveMovies = () => {
  const [state, setState] = useState({
    movies: [],
    loading: true,
    error: null
  });

  // Create reactive streams (only once)
  const streams = useMemo(() => {
    const searchQuery$ = new BehaviorSubject("");
    const category$ = new BehaviorSubject("popular");
    const page$ = new BehaviorSubject(1);
    const filters$ = new BehaviorSubject({});

    // Debounced search stream
    const debouncedSearch$ = searchQuery$.pipe(debounceTime(300), distinctUntilChanged());

    // Combined request parameters
    const requestParams$ = combineLatest([debouncedSearch$, category$, page$, filters$]);

    // Main data stream
    const movies$ = requestParams$.pipe(
      switchMap(([query, category, page, filters]) => {
        const loading$ = new BehaviorSubject(true);

        let apiCall;
        if (query.trim()) {
          apiCall = movieApi.search(query, page);
        } else {
          switch (category) {
            case "top_rated":
              apiCall = movieApi.getTopRated(page);
              break;
            case "upcoming":
              apiCall = movieApi.getUpcoming(page);
              break;
            default:
              apiCall = movieApi.getPopular(page);
          }
        }

        return apiCall
          .then((result) => ({
            ...result,
            loading: false,
            error: null
          }))
          .catch((error) => ({
            movies: [],
            loading: false,
            error: error.message
          }));
      }),
      startWith({ movies: [], loading: true, error: null })
    );

    return {
      searchQuery$,
      category$,
      page$,
      filters$,
      movies$
    };
  }, []);

  // Subscribe to the reactive stream
  useEffect(() => {
    const subscription = streams.movies$.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [streams]);

  // Action creators
  const actions = useMemo(
    () => ({
      setSearchQuery: (query) => streams.searchQuery$.next(query),
      setCategory: (category) => streams.category$.next(category),
      setPage: (page) => streams.page$.next(page),
      setFilters: (filters) => streams.filters$.next(filters)
    }),
    [streams]
  );

  return {
    ...state,
    actions
  };
};
```

### **2. Reactive Movie Search Component**

```jsx
// src/features/movies/components/ReactiveMovieSearch.jsx
import React from "react";
import { Input, Select, Spin, Card, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useReactiveMovies } from "@/shared/hooks/useReactiveMovie";

const { Option } = Select;

const ReactiveMovieSearch = () => {
  const { movies, loading, error, actions } = useReactiveMovies();

  return (
    <div className="reactive-movie-search">
      {/* Search Controls */}
      <div className="search-controls mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input
              placeholder="Search movies..."
              prefix={<SearchOutlined />}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Category"
              onChange={actions.setCategory}
              defaultValue="popular"
              style={{ width: "100%" }}
            >
              <Option value="popular">Popular</Option>
              <Option value="top_rated">Top Rated</Option>
              <Option value="upcoming">Upcoming</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Results */}
      <div className="search-results">
        {loading && (
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="mt-4">Loading movies...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <Row gutter={[16, 16]}>
            {movies.map((movie) => (
              <Col key={movie.id} xs={24} sm={12} md={8} lg={6}>
                <MovieCard movie={movie} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ReactiveMovieSearch;
```

### **3. Reactive State Management with Zustand**

```javascript
// src/features/movies/store/reactiveMovieStore.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, switchMap } from "rxjs";
import { movieApi } from "../services/movieApi";

const useReactiveMovieStore = create(
  subscribeWithSelector((set, get) => {
    // Reactive streams
    const searchQuery$ = new BehaviorSubject("");
    const filters$ = new BehaviorSubject({});
    const category$ = new BehaviorSubject("popular");

    // Reactive pipeline
    const movies$ = combineLatest([
      searchQuery$.pipe(debounceTime(300), distinctUntilChanged()),
      category$,
      filters$
    ]).pipe(
      switchMap(async ([query, category, filters]) => {
        set({ loading: true, error: null });

        try {
          let result;
          if (query.trim()) {
            result = await movieApi.search(query);
          } else {
            result = await movieApi.getByCategory(category);
          }

          set({
            movies: result.movies,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            movies: [],
            loading: false,
            error: error.message
          });
        }
      })
    );

    // Subscribe to reactive stream
    movies$.subscribe();

    return {
      // State
      movies: [],
      loading: false,
      error: null,
      searchQuery: "",
      category: "popular",
      filters: {},

      // Reactive actions
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        searchQuery$.next(query);
      },

      setCategory: (category) => {
        set({ category });
        category$.next(category);
      },

      setFilters: (filters) => {
        set({ filters });
        filters$.next(filters);
      },

      // Streams for external access
      streams: {
        searchQuery$,
        category$,
        filters$,
        movies$
      }
    };
  })
);

export default useReactiveMovieStore;
```

### **4. Custom Reactive Hooks**

```javascript
// src/shared/hooks/useReactiveState.js
import { useState, useEffect, useMemo } from "react";
import { BehaviorSubject } from "rxjs";

/**
 * Create a reactive state that can be observed
 */
export const useReactiveState = (initialValue) => {
  const [state, setState] = useState(initialValue);

  const subject$ = useMemo(() => new BehaviorSubject(initialValue), []);

  const setValue = (newValue) => {
    setState(newValue);
    subject$.next(newValue);
  };

  return [state, setValue, subject$];
};

// src/shared/hooks/useReactiveEffect.js
import { useEffect } from "react";

/**
 * React to observable streams
 */
export const useReactiveEffect = (observable$, callback, deps = []) => {
  useEffect(() => {
    const subscription = observable$.subscribe(callback);
    return () => subscription.unsubscribe();
  }, deps);
};

// src/shared/hooks/useDebounced.js
import { useState, useEffect, useMemo } from "react";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";

/**
 * Debounced reactive value
 */
export const useDebounced = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const subject$ = useMemo(() => new BehaviorSubject(value), []);

  useEffect(() => {
    const subscription = subject$.pipe(debounceTime(delay), distinctUntilChanged()).subscribe(setDebouncedValue);

    return () => subscription.unsubscribe();
  }, [subject$, delay]);

  useEffect(() => {
    subject$.next(value);
  }, [value, subject$]);

  return debouncedValue;
};
```

### **5. Reactive Form Handling**

```jsx
// src/shared/components/forms/ReactiveForm.jsx
import React, { useMemo } from "react";
import { Form, Input, Button } from "antd";
import { BehaviorSubject, combineLatest, map, debounceTime } from "rxjs";
import { useReactiveEffect } from "@/shared/hooks/useReactiveEffect";

const ReactiveForm = ({ onSubmit, validationRules = {} }) => {
  const [form] = Form.useForm();

  // Reactive form streams
  const formStreams = useMemo(() => {
    const fields = {};
    const validation = {};

    // Create streams for each field
    Object.keys(validationRules).forEach((fieldName) => {
      fields[fieldName] = new BehaviorSubject("");

      // Validation stream for each field
      validation[fieldName] = fields[fieldName].pipe(
        debounceTime(300),
        map((value) => {
          const rules = validationRules[fieldName];
          if (!rules) return { valid: true, errors: [] };

          const errors = [];

          if (rules.required && !value.trim()) {
            errors.push(`${fieldName} is required`);
          }

          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
          }

          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${fieldName} format is invalid`);
          }

          return {
            valid: errors.length === 0,
            errors
          };
        })
      );
    });

    // Combined form validation
    const isFormValid$ = combineLatest(Object.values(validation)).pipe(
      map((validations) => validations.every((v) => v.valid))
    );

    return { fields, validation, isFormValid$ };
  }, [validationRules]);

  // Subscribe to form validation
  useReactiveEffect(
    formStreams.isFormValid$,
    (isValid) => {
      // Update form state based on validation
      console.log("Form is valid:", isValid);
    },
    []
  );

  const handleFieldChange = (fieldName, value) => {
    formStreams.fields[fieldName].next(value);
  };

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      {Object.keys(validationRules).map((fieldName) => (
        <Form.Item key={fieldName} name={fieldName} label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}>
          <Input onChange={(e) => handleFieldChange(fieldName, e.target.value)} placeholder={`Enter ${fieldName}`} />
        </Form.Item>
      ))}

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReactiveForm;
```

## 🎯 **Benefits of Reactive Programming**

### **1. Automatic Updates**

- ✅ Changes automatically propagate through the system
- ✅ No manual state synchronization needed
- ✅ Consistent data flow

### **2. Declarative Code**

- ✅ Describe what should happen, not how
- ✅ More readable and maintainable
- ✅ Less boilerplate code

### **3. Composability**

- ✅ Combine multiple data streams easily
- ✅ Reuse reactive patterns
- ✅ Build complex behaviors from simple parts

### **4. Error Handling**

- ✅ Centralized error handling
- ✅ Graceful error recovery
- ✅ Predictable error flows

### **5. Performance**

- ✅ Automatic debouncing and throttling
- ✅ Efficient change detection
- ✅ Optimized re-renders

## 📚 **Popular Reactive Libraries**

### **1. RxJS** (Most Popular)

```bash
npm install rxjs
```

### **2. MobX** (React-friendly)

```bash
npm install mobx mobx-react-lite
```

### **3. Recoil** (Facebook's solution)

```bash
npm install recoil
```

### **4. Jotai** (Atomic approach)

```bash
npm install jotai
```

## 🚀 **Getting Started in Your Movie App**

1. **Install RxJS**:

   ```bash
   npm install rxjs
   ```

2. **Create reactive hooks** for common patterns
3. **Implement reactive search** with debouncing
4. **Add reactive state management** for global state
5. **Use reactive forms** for complex form validation

Reactive programming makes your Movie App more responsive, maintainable, and user-friendly! 🎬✨
