# View Examples: The User Interface Layer

## 🎨 **What Views Actually Do**

Views are the **face** of your application that handle:

- 🖼️ **UI Rendering** → Display data and interactive elements
- 🎭 **User Interaction** → Handle clicks, forms, and input events
- 🎨 **Visual Presentation** → Styling, layout, and visual feedback
- 📱 **Responsive Design** → Adapt to different screen sizes and devices
- ♿ **Accessibility** → Ensure usability for all users

## 📝 **View vs Other Layers**

```javascript
// ✅ View Responsibility:
// - Rendering UI components and layouts
// - Handling user interactions (clicks, form inputs)
// - Visual styling and animations
// - Accessibility and user experience
// - Data presentation and formatting

// ❌ NOT View Responsibility:
// - Business logic calculations (that's Model layer)
// - API calls and data fetching (that's Service layer)
// - Complex state management (that's Controller layer)
// - Data validation rules (that's Model layer)
```

## 🎬 **Movie View Examples**

### **MovieCard Component (React)**

```javascript
// src/features/movies/views/components/MovieCard/MovieCard.js
import React from "react";
import "./MovieCard.css";

const MovieCard = ({ movie, onClick, onFavorite, onAddToWatchlist, isLoading = false, className = "" }) => {
  // 🎭 EVENT HANDLING: Handle user interactions
  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick && !isLoading) {
      onClick(movie);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onFavorite && !isLoading) {
      onFavorite(movie);
    }
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onAddToWatchlist && !isLoading) {
      onAddToWatchlist(movie);
    }
  };

  // 🎨 CONDITIONAL RENDERING: Handle loading state
  if (isLoading) {
    return <MovieCardSkeleton className={className} />;
  }

  // 🎨 CONDITIONAL RENDERING: Handle missing movie data
  if (!movie) {
    return <div className={`movie-card-error ${className}`}>Movie data unavailable</div>;
  }

  // Get display data from model (Views use model's formatted data)
  const displayData = movie.getDisplayData();

  return (
    <div
      className={`movie-card ${className} ${displayData.ratingClass}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick(e);
        }
      }}
      aria-label={`Movie: ${displayData.title}`}
    >
      {/* 🖼️ VISUAL PRESENTATION: Movie poster */}
      <div className="movie-card__poster">
        <img
          src={displayData.posterUrl}
          alt={`${displayData.title} poster`}
          loading="lazy"
          onError={(e) => {
            e.target.src = "/images/no-poster-placeholder.jpg";
          }}
        />

        {/* 🎨 VISUAL FEEDBACK: Rating badge */}
        <div className={`movie-card__rating-badge rating-${displayData.ratingClass}`}>
          {displayData.rating.split("/")[0]}
        </div>

        {/* 🎨 VISUAL FEEDBACK: Popularity tier */}
        {displayData.popularityTier === "viral" && <div className="movie-card__viral-badge">🔥 Viral</div>}

        {/* 🎭 INTERACTIVE ELEMENTS: Action buttons */}
        <div className="movie-card__actions">
          <button
            className="movie-card__favorite-btn"
            onClick={handleFavoriteClick}
            aria-label={`Add ${displayData.title} to favorites`}
            title="Add to Favorites"
          >
            ❤️
          </button>
          <button
            className="movie-card__watchlist-btn"
            onClick={handleWatchlistClick}
            aria-label={`Add ${displayData.title} to watchlist`}
            title="Add to Watchlist"
          >
            📋
          </button>
        </div>
      </div>

      {/* 🖼️ VISUAL PRESENTATION: Movie info */}
      <div className="movie-card__info">
        <h3 className="movie-card__title" title={displayData.title}>
          {displayData.title}
        </h3>

        <div className="movie-card__meta">
          <span className="movie-card__year">{displayData.year}</span>
          <span className="movie-card__genres">{displayData.genres.slice(0, 2).join(", ")}</span>
        </div>

        <p className="movie-card__description" title={displayData.description}>
          {displayData.description}
        </p>

        {/* 🎨 VISUAL INDICATORS: Status badges */}
        <div className="movie-card__badges">
          {displayData.releaseStatus === "upcoming" && <span className="badge badge--upcoming">Coming Soon</span>}
          {displayData.releaseStatus === "recent" && <span className="badge badge--new">New</span>}
        </div>
      </div>
    </div>
  );
};

// 🎨 LOADING STATE COMPONENT
const MovieCardSkeleton = ({ className }) => (
  <div className={`movie-card movie-card--skeleton ${className}`}>
    <div className="movie-card__poster skeleton"></div>
    <div className="movie-card__info">
      <div className="skeleton skeleton--text skeleton--title"></div>
      <div className="skeleton skeleton--text skeleton--meta"></div>
      <div className="skeleton skeleton--text skeleton--description"></div>
    </div>
  </div>
);

export default MovieCard;
```

### **MovieCard CSS Styles**

```css
/* src/features/movies/views/components/MovieCard/MovieCard.css */

/* 🎨 BASE STYLES */
.movie-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  height: 100%;
}

/* 🎭 INTERACTIVE STATES */
.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.movie-card:focus {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

.movie-card:active {
  transform: translateY(-2px);
}

/* 🖼️ POSTER SECTION */
.movie-card__poster {
  position: relative;
  overflow: hidden;
  aspect-ratio: 2/3;
}

.movie-card__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-card__poster img {
  transform: scale(1.05);
}

/* 🎨 RATING BADGE */
.movie-card__rating-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: bold;
}

.rating-excellent {
  background: #28a745;
}
.rating-good {
  background: #17a2b8;
}
.rating-average {
  background: #ffc107;
  color: #000;
}
.rating-poor {
  background: #dc3545;
}

/* 🎨 VIRAL BADGE */
.movie-card__viral-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: #000;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 🎭 ACTION BUTTONS */
.movie-card__actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.movie-card:hover .movie-card__actions {
  opacity: 1;
  transform: translateY(0);
}

.movie-card__favorite-btn,
.movie-card__watchlist-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.movie-card__favorite-btn:hover,
.movie-card__watchlist-btn:hover {
  background: white;
  transform: scale(1.1);
}

/* 🖼️ INFO SECTION */
.movie-card__info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.movie-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.movie-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #666;
}

.movie-card__year {
  font-weight: 500;
}

.movie-card__genres {
  color: #888;
}

.movie-card__description {
  font-size: 0.875rem;
  color: #555;
  line-height: 1.5;
  margin: 0 0 12px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex: 1;
}

/* 🎨 BADGES */
.movie-card__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge--upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.badge--new {
  background: #e8f5e8;
  color: #2e7d32;
}

/* 🎨 LOADING SKELETON */
.movie-card--skeleton {
  pointer-events: none;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton--text {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton--title {
  height: 20px;
  width: 80%;
}

.skeleton--meta {
  width: 60%;
}

.skeleton--description {
  width: 100%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 📱 RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .movie-card__info {
    padding: 12px;
  }

  .movie-card__title {
    font-size: 1rem;
  }

  .movie-card__actions {
    bottom: 4px;
    right: 4px;
  }
}

/* ♿ ACCESSIBILITY */
@media (prefers-reduced-motion: reduce) {
  .movie-card,
  .movie-card__poster img,
  .movie-card__actions,
  .movie-card__favorite-btn,
  .movie-card__watchlist-btn {
    transition: none;
  }

  .movie-card__viral-badge {
    animation: none;
  }
}

/* 🌙 DARK MODE */
@media (prefers-color-scheme: dark) {
  .movie-card {
    background: #1a1a1a;
    color: #ffffff;
  }

  .movie-card__meta {
    color: #cccccc;
  }

  .movie-card__genres {
    color: #aaaaaa;
  }

  .movie-card__description {
    color: #dddddd;
  }
}
```

### **MovieList Component**

```javascript
// src/features/movies/views/components/MovieList/MovieList.js
import React, { useState, useMemo, useCallback } from "react";
import MovieCard from "../MovieCard/MovieCard";
import "./MovieList.css";

const MovieList = ({
  movies = [],
  loading = false,
  error = null,
  onMovieClick,
  onMovieFavorite,
  onMovieWatchlist,
  viewMode = "grid", // 'grid' | 'list'
  sortBy = "popularity",
  filterBy = {},
  className = ""
}) => {
  // 🎭 LOCAL STATE: View preferences
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // 🧠 COMPUTED VALUES: Process and filter movies
  const processedMovies = useMemo(() => {
    let filtered = [...movies];

    // Apply filters
    if (filterBy.genre) {
      filtered = filtered.filter((movie) => movie.hasGenre(filterBy.genre));
    }

    if (filterBy.minRating) {
      filtered = filtered.filter((movie) => movie.meetsRatingCriteria(filterBy.minRating));
    }

    if (filterBy.year) {
      filtered = filtered.filter((movie) => movie.isFromYear(filterBy.year));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "year":
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        case "title":
          return a.title.localeCompare(b.title);
        case "popularity":
        default:
          return b.popularity - a.popularity;
      }
    });

    return filtered;
  }, [movies, filterBy, sortBy]);

  // 🧠 COMPUTED VALUES: Pagination
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedMovies.slice(startIndex, endIndex);
  }, [processedMovies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedMovies.length / itemsPerPage);

  // 🎭 EVENT HANDLERS: Pagination
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Scroll to top of list
    document.querySelector(".movie-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, []);

  // 🎭 EVENT HANDLERS: Movie interactions
  const handleMovieClick = useCallback(
    (movie) => {
      onMovieClick?.(movie);
    },
    [onMovieClick]
  );

  const handleMovieFavorite = useCallback(
    (movie) => {
      onMovieFavorite?.(movie);
    },
    [onMovieFavorite]
  );

  const handleMovieWatchlist = useCallback(
    (movie) => {
      onMovieWatchlist?.(movie);
    },
    [onMovieWatchlist]
  );

  // 🎨 CONDITIONAL RENDERING: Error state
  if (error) {
    return (
      <div className={`movie-list-error ${className}`}>
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // 🎨 CONDITIONAL RENDERING: Loading state
  if (loading) {
    return (
      <div className={`movie-list ${className}`}>
        <div className={`movie-list__grid movie-list__grid--${viewMode}`}>
          {Array.from({ length: itemsPerPage }, (_, index) => (
            <MovieCard key={index} isLoading={true} />
          ))}
        </div>
      </div>
    );
  }

  // 🎨 CONDITIONAL RENDERING: Empty state
  if (!loading && processedMovies.length === 0) {
    return (
      <div className={`movie-list-empty ${className}`}>
        <div className="empty-icon">🎬</div>
        <h3>No movies found</h3>
        <p>Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className={`movie-list ${className}`}>
      {/* 🖼️ VISUAL PRESENTATION: List header with stats */}
      <div className="movie-list__header">
        <div className="movie-list__stats">
          <span className="movie-list__count">{processedMovies.length} movies</span>
          {filterBy.genre && <span className="movie-list__filter-tag">Genre: {filterBy.genre}</span>}
        </div>

        {/* 🎭 INTERACTIVE CONTROLS: View mode toggle */}
        <div className="movie-list__controls">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* 🖼️ VISUAL PRESENTATION: Movies grid/list */}
      <div className={`movie-list__grid movie-list__grid--${viewMode}`}>
        {paginatedMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={handleMovieClick}
            onFavorite={handleMovieFavorite}
            onAddToWatchlist={handleMovieWatchlist}
            className={viewMode === "list" ? "movie-card--list" : ""}
          />
        ))}
      </div>

      {/* 🎭 INTERACTIVE ELEMENTS: Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

// 🎭 PAGINATION COMPONENT
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination__btn pagination__btn--prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <div className="pagination__numbers">
        {currentPage > 3 && (
          <>
            <button className="pagination__number" onClick={() => onPageChange(1)}>
              1
            </button>
            {currentPage > 4 && <span className="pagination__ellipsis">...</span>}
          </>
        )}

        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`pagination__number ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <span className="pagination__ellipsis">...</span>}
            <button className="pagination__number" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        className="pagination__btn pagination__btn--next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
};

export default MovieList;
```

### **SearchBar Component**

```javascript
// src/features/movies/views/components/SearchBar/SearchBar.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import "./SearchBar.css";

const SearchBar = ({
  onSearch,
  onFilterChange,
  placeholder = "Search movies...",
  debounceMs = 300,
  suggestions = [],
  showFilters = true,
  className = ""
}) => {
  // 🎭 LOCAL STATE: Search functionality
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    minRating: ""
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  // 🎭 REFS: DOM manipulation
  const searchInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // 🎭 EFFECT: Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        onSearch?.(query.trim(), filters);
      }
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, filters, onSearch, debounceMs]);

  // 🎭 EVENT HANDLERS: Search input
  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);
      setShowSuggestions(value.length > 0 && suggestions.length > 0);
      setActiveSuggestion(-1);
    },
    [suggestions.length]
  );

  const handleInputFocus = useCallback(() => {
    setIsExpanded(true);
    if (query.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [query.length, suggestions.length]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      if (!query.trim()) {
        setIsExpanded(false);
      }
    }, 200);
  }, [query]);

  // 🎭 EVENT HANDLERS: Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case "Enter":
          e.preventDefault();
          if (activeSuggestion >= 0) {
            selectSuggestion(suggestions[activeSuggestion]);
          } else if (query.trim()) {
            handleSearch();
          }
          break;

        case "Escape":
          setShowSuggestions(false);
          setActiveSuggestion(-1);
          searchInputRef.current?.blur();
          break;
      }
    },
    [showSuggestions, suggestions, activeSuggestion, query]
  );

  // 🎭 EVENT HANDLERS: Suggestion selection
  const selectSuggestion = useCallback(
    (suggestion) => {
      setQuery(suggestion);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      onSearch?.(suggestion, filters);
    },
    [filters, onSearch]
  );

  // 🎭 EVENT HANDLERS: Search submission
  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch?.(query.trim(), filters);
      setShowSuggestions(false);
    }
  }, [query, filters, onSearch]);

  // 🎭 EVENT HANDLERS: Filter changes
  const handleFilterChange = useCallback(
    (filterName, value) => {
      const newFilters = { ...filters, [filterName]: value };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  // 🎭 EVENT HANDLERS: Clear search
  const handleClear = useCallback(() => {
    setQuery("");
    setFilters({ genre: "", year: "", minRating: "" });
    setShowSuggestions(false);
    setIsExpanded(false);
    searchInputRef.current?.focus();
    onSearch?.("", {});
  }, [onSearch]);

  return (
    <div className={`search-bar ${isExpanded ? "expanded" : ""} ${className}`}>
      {/* 🖼️ MAIN SEARCH INPUT */}
      <div className="search-bar__input-container">
        <div className="search-bar__input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            className="search-bar__input"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            aria-label="Search movies"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-activedescendant={activeSuggestion >= 0 ? `suggestion-${activeSuggestion}` : undefined}
          />

          {/* 🎨 VISUAL ELEMENTS: Search icon */}
          <button
            className="search-bar__search-btn"
            onClick={handleSearch}
            disabled={!query.trim()}
            aria-label="Search"
          >
            🔍
          </button>

          {/* 🎨 VISUAL ELEMENTS: Clear button */}
          {query && (
            <button className="search-bar__clear-btn" onClick={handleClear} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* 🎭 SUGGESTIONS DROPDOWN */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="search-bar__suggestions" role="listbox" aria-label="Search suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                id={`suggestion-${index}`}
                className={`search-bar__suggestion ${index === activeSuggestion ? "active" : ""}`}
                onClick={() => selectSuggestion(suggestion)}
                role="option"
                aria-selected={index === activeSuggestion}
              >
                <span className="suggestion-icon">🔍</span>
                <span className="suggestion-text">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎭 FILTER CONTROLS */}
      {showFilters && (
        <div className="search-bar__filters">
          <div className="filter-group">
            <label htmlFor="genre-filter" className="filter-label">
              Genre:
            </label>
            <select
              id="genre-filter"
              className="filter-select"
              value={filters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Science Fiction">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="year-filter" className="filter-label">
              Year:
            </label>
            <select
              id="year-filter"
              className="filter-select"
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
            >
              <option value="">Any Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="rating-filter" className="filter-label">
              Min Rating:
            </label>
            <select
              id="rating-filter"
              className="filter-select"
              value={filters.minRating}
              onChange={(e) => handleFilterChange("minRating", e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="7">7.0+</option>
              <option value="8">8.0+</option>
              <option value="9">9.0+</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
```

## 🔐 **Login Form View Example**

```javascript
// src/features/authentication/views/components/LoginForm/LoginForm.js
import React, { useState, useCallback } from "react";
import "./LoginForm.css";

const LoginForm = ({ onSubmit, loading = false, error = null, className = "" }) => {
  // 🎭 LOCAL STATE: Form data and validation
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  // 🔍 VALIDATION: Form validation rules
  const validateField = useCallback((name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";

      default:
        return "";
    }
  }, []);

  // 🎭 EVENT HANDLERS: Input changes
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));

      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: ""
        }));
      }
    },
    [formErrors]
  );

  // 🎭 EVENT HANDLERS: Input blur (validation)
  const handleInputBlur = useCallback(
    (e) => {
      const { name, value } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true
      }));

      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    },
    [validateField]
  );

  // 🎭 EVENT HANDLERS: Form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Validate all fields
      const errors = {};
      Object.keys(formData).forEach((key) => {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      });

      setFormErrors(errors);
      setTouched({
        email: true,
        password: true
      });

      // Submit if no errors
      if (Object.keys(errors).length === 0) {
        onSubmit?.(formData);
      }
    },
    [formData, validateField, onSubmit]
  );

  // 🎭 EVENT HANDLERS: Password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <form className={`login-form ${className}`} onSubmit={handleSubmit} noValidate>
      {/* 🖼️ FORM HEADER */}
      <div className="login-form__header">
        <h2 className="login-form__title">Welcome Back</h2>
        <p className="login-form__subtitle">Sign in to your account</p>
      </div>

      {/* 🎨 ERROR DISPLAY */}
      {error && (
        <div className="login-form__error" role="alert">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}

      {/* 🎭 EMAIL FIELD */}
      <div className="form-field">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`form-input ${touched.email && formErrors.email ? "error" : ""}`}
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Enter your email"
          disabled={loading}
          aria-describedby={touched.email && formErrors.email ? "email-error" : undefined}
          aria-invalid={touched.email && formErrors.email ? "true" : "false"}
        />
        {touched.email && formErrors.email && (
          <div id="email-error" className="form-error" role="alert">
            {formErrors.email}
          </div>
        )}
      </div>

      {/* 🎭 PASSWORD FIELD */}
      <div className="form-field">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="password-input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className={`form-input ${touched.password && formErrors.password ? "error" : ""}`}
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Enter your password"
            disabled={loading}
            aria-describedby={touched.password && formErrors.password ? "password-error" : undefined}
            aria-invalid={touched.password && formErrors.password ? "true" : "false"}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            disabled={loading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {touched.password && formErrors.password && (
          <div id="password-error" className="form-error" role="alert">
            {formErrors.password}
          </div>
        )}
      </div>

      {/* 🎭 SUBMIT BUTTON */}
      <button
        type="submit"
        className={`login-form__submit ${loading ? "loading" : ""}`}
        disabled={loading || Object.keys(formErrors).some((key) => formErrors[key])}
      >
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {/* 🖼️ FORM FOOTER */}
      <div className="login-form__footer">
        <a href="/forgot-password" className="login-form__link">
          Forgot your password?
        </a>
        <p className="login-form__signup">
          Don't have an account?{" "}
          <a href="/register" className="login-form__link">
            Sign up
          </a>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
```

## 🛒 **Shopping Cart View Example (Vanilla JavaScript)**

```javascript
// src/features/cart/views/CartView.js
class CartView {
  constructor(container, cartController) {
    this.container = container;
    this.controller = cartController;
    this.currentCart = null;

    this.bindEvents();
    this.render();
  }

  // 🎭 EVENT BINDING: Attach event listeners
  bindEvents() {
    // Delegate events to container
    this.container.addEventListener("click", this.handleClick.bind(this));
    this.container.addEventListener("change", this.handleChange.bind(this));

    // Listen to cart updates from controller
    this.controller.onCartUpdate = this.handleCartUpdate.bind(this);
  }

  // 🎭 EVENT HANDLING: Click events
  handleClick(e) {
    const target = e.target;

    if (target.matches(".cart-item__remove")) {
      e.preventDefault();
      const itemId = target.dataset.itemId;
      this.controller.removeItem(itemId);
    }

    if (target.matches(".cart-item__quantity-btn")) {
      e.preventDefault();
      const itemId = target.dataset.itemId;
      const action = target.dataset.action;

      if (action === "increase") {
        this.controller.increaseQuantity(itemId);
      } else if (action === "decrease") {
        this.controller.decreaseQuantity(itemId);
      }
    }

    if (target.matches(".cart__checkout-btn")) {
      e.preventDefault();
      this.controller.proceedToCheckout();
    }

    if (target.matches(".cart__clear-btn")) {
      e.preventDefault();
      if (confirm("Are you sure you want to clear your cart?")) {
        this.controller.clearCart();
      }
    }
  }

  // 🎭 EVENT HANDLING: Input changes
  handleChange(e) {
    const target = e.target;

    if (target.matches(".cart-item__quantity-input")) {
      const itemId = target.dataset.itemId;
      const quantity = parseInt(target.value, 10);

      if (quantity > 0) {
        this.controller.updateQuantity(itemId, quantity);
      }
    }
  }

  // 🎭 UPDATE HANDLING: Cart data changes
  handleCartUpdate(cart) {
    this.currentCart = cart;
    this.render();
  }

  // 🖼️ RENDERING: Main render method
  render() {
    if (!this.currentCart) {
      this.renderEmpty();
      return;
    }

    if (this.currentCart.items.length === 0) {
      this.renderEmpty();
      return;
    }

    this.renderCart();
  }

  // 🖼️ RENDERING: Empty cart state
  renderEmpty() {
    this.container.innerHTML = `
      <div class="cart cart--empty">
        <div class="cart__empty-state">
          <div class="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some items to get started</p>
          <a href="/products" class="btn btn--primary">
            Browse Products
          </a>
        </div>
      </div>
    `;
  }

  // 🖼️ RENDERING: Cart with items
  renderCart() {
    const cart = this.currentCart;

    this.container.innerHTML = `
      <div class="cart">
        <div class="cart__header">
          <h2 class="cart__title">Shopping Cart</h2>
          <span class="cart__item-count">
            ${cart.totalItems} ${cart.totalItems === 1 ? "item" : "items"}
          </span>
        </div>

        <div class="cart__items">
          ${cart.items.map((item) => this.renderCartItem(item)).join("")}
        </div>

        <div class="cart__summary">
          ${this.renderCartSummary(cart)}
        </div>

        <div class="cart__actions">
          <button class="cart__clear-btn btn btn--secondary">
            Clear Cart
          </button>
          <button class="cart__checkout-btn btn btn--primary">
            Proceed to Checkout
          </button>
        </div>
      </div>
    `;
  }

  // 🖼️ RENDERING: Individual cart item
  renderCartItem(item) {
    const product = item.product;
    const displayData = product.getDisplayData();

    return `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item__image">
          <img 
            src="${displayData.mainImage}" 
            alt="${displayData.name}"
            loading="lazy"
          />
        </div>

        <div class="cart-item__details">
          <h3 class="cart-item__name">${displayData.name}</h3>
          <p class="cart-item__brand">${displayData.brand}</p>
          
          ${
            displayData.isOnSale
              ? `
            <div class="cart-item__pricing">
              <span class="cart-item__original-price">
                $${displayData.originalPrice.toFixed(2)}
              </span>
              <span class="cart-item__sale-price">
                $${displayData.effectivePrice.toFixed(2)}
              </span>
              <span class="cart-item__discount">
                ${displayData.discountPercentage}% off
              </span>
            </div>
          `
              : `
            <div class="cart-item__pricing">
              <span class="cart-item__price">
                $${displayData.effectivePrice.toFixed(2)}
              </span>
            </div>
          `
          }
        </div>

        <div class="cart-item__quantity">
          <label class="cart-item__quantity-label">Quantity:</label>
          <div class="quantity-controls">
            <button 
              class="cart-item__quantity-btn" 
              data-item-id="${item.id}" 
              data-action="decrease"
              ${item.quantity <= 1 ? "disabled" : ""}
            >
              −
            </button>
            <input 
              type="number" 
              class="cart-item__quantity-input"
              data-item-id="${item.id}"
              value="${item.quantity}"
              min="1"
              max="${product.stock}"
            />
            <button 
              class="cart-item__quantity-btn" 
              data-item-id="${item.id}" 
              data-action="increase"
              ${item.quantity >= product.stock ? "disabled" : ""}
            >
              +
            </button>
          </div>
        </div>

        <div class="cart-item__total">
          <span class="cart-item__total-price">
            $${(displayData.effectivePrice * item.quantity).toFixed(2)}
          </span>
        </div>

        <div class="cart-item__actions">
          <button 
            class="cart-item__remove" 
            data-item-id="${item.id}"
            aria-label="Remove ${displayData.name} from cart"
          >
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  // 🖼️ RENDERING: Cart summary
  renderCartSummary(cart) {
    return `
      <div class="cart-summary">
        <div class="cart-summary__row">
          <span class="cart-summary__label">Subtotal:</span>
          <span class="cart-summary__value">$${cart.subtotal.toFixed(2)}</span>
        </div>

        ${
          cart.totalDiscount > 0
            ? `
          <div class="cart-summary__row cart-summary__row--discount">
            <span class="cart-summary__label">Discount:</span>
            <span class="cart-summary__value">-$${cart.totalDiscount.toFixed(2)}</span>
          </div>
        `
            : ""
        }

        <div class="cart-summary__row">
          <span class="cart-summary__label">Shipping:</span>
          <span class="cart-summary__value">
            ${cart.shippingCost === 0 ? "Free" : `$${cart.shippingCost.toFixed(2)}`}
          </span>
        </div>

        <div class="cart-summary__row">
          <span class="cart-summary__label">Tax:</span>
          <span class="cart-summary__value">$${cart.tax.toFixed(2)}</span>
        </div>

        <div class="cart-summary__row cart-summary__row--total">
          <span class="cart-summary__label">Total:</span>
          <span class="cart-summary__value">$${cart.total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  // 🎨 VISUAL FEEDBACK: Show loading state
  showLoading() {
    this.container.classList.add("loading");
  }

  // 🎨 VISUAL FEEDBACK: Hide loading state
  hideLoading() {
    this.container.classList.remove("loading");
  }

  // 🎨 VISUAL FEEDBACK: Show error message
  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "cart__error";
    errorDiv.innerHTML = `
      <span class="error-icon">⚠️</span>
      <span class="error-message">${message}</span>
    `;

    this.container.insertBefore(errorDiv, this.container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  // 🧹 CLEANUP: Remove event listeners
  destroy() {
    this.container.removeEventListener("click", this.handleClick);
    this.container.removeEventListener("change", this.handleChange);
  }
}

export default CartView;
```

## 🎯 **View Benefits**

### **1. User Experience Focus**

- ✅ Responsive design for all devices
- ✅ Accessibility features for all users
- ✅ Visual feedback and loading states
- ✅ Intuitive interactions and navigation

### **2. Separation of Concerns**

- ✅ Views only handle presentation and user interaction
- ✅ Business logic stays in Models
- ✅ Coordination logic stays in Controllers
- ✅ Clean, maintainable code structure

### **3. Reusability**

- ✅ Components can be reused across pages
- ✅ Consistent design patterns
- ✅ Modular and composable architecture

### **4. Performance**

- ✅ Efficient rendering and updates
- ✅ Lazy loading and optimization
- ✅ Smooth animations and transitions

## ✅ **View Checklist**

Views should:

- ✅ **Handle** user interactions and events
- ✅ **Render** data provided by controllers/models
- ✅ **Provide** visual feedback and loading states
- ✅ **Ensure** accessibility and responsiveness
- ✅ **Maintain** consistent styling and UX patterns

Views should NOT:

- ❌ **Contain** business logic (that's Models)
- ❌ **Make** API calls directly (that's Services)
- ❌ **Manage** complex state (that's Controllers)
- ❌ **Perform** data validation (that's Models)
- ❌ **Handle** routing logic (that's Controllers)

Views are the **face** of your application! 🎨
