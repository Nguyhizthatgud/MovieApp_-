# Model Examples: The Business Logic Layer

## 📊 **What Models Actually Do**

Models are the **brain** of your application that handle:

- 🧠 **Business Logic** → Rules, calculations, and domain-specific operations
- 🔍 **Data Validation** → Ensure data integrity and business rules
- 🔄 **Data Transformation** → Convert, format, and process data
- 📋 **Domain Knowledge** → Encapsulate what your business knows about entities
- 🛡️ **Data Integrity** → Maintain consistent and valid state

## 📝 **Model vs Other Layers**

```typescript
// ✅ Model Responsibility:
// - Business rules and logic
// - Data validation and
// - Domain-specific calculations
// - Entity behavior and state management
// - Data transformation and formatting

// ❌ NOT Model Responsibility:
// - API calls (that's Service layer)
// - UI rendering (that's View layer)
// - User interaction handling (that's Controller layer)
// - Database queries (that's Repository layer)
```

## 🎬 **Movie Model Examples**

### **Core Movie Entity**

```typescript
// src/features/movies/models/Movie.ts
export interface MovieData {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  runtime?: number;
  budget?: number;
  revenue?: number;
}

export class Movie {
  private data: MovieData;

  constructor(movieData: MovieData) {
    this.data = { ...movieData };
    this.validateAndSanitize();
  }

  // 🧠 BUSINESS LOGIC: Movie rating classification
  getRatingClass(): "excellent" | "good" | "average" | "poor" {
    const rating = this.data.vote_average;
    if (rating >= 8.5) return "excellent";
    if (rating >= 7.0) return "good";
    if (rating >= 5.0) return "average";
    return "poor";
  }

  // 🧠 BUSINESS LOGIC: Popularity tier
  getPopularityTier(): "viral" | "trending" | "popular" | "niche" {
    const popularity = this.data.popularity;
    if (popularity >= 100) return "viral";
    if (popularity >= 50) return "trending";
    if (popularity >= 20) return "popular";
    return "niche";
  }

  // 🧠 BUSINESS LOGIC: Content appropriateness
  isAppropriateForAge(age: number): boolean {
    // Business rule: Adult content restriction
    if (this.data.adult && age < 18) {
      return false;
    }

    // Business rule: Horror movies for younger audiences
    if (this.hasGenre("Horror") && age < 13) {
      return false;
    }

    // Business rule: Very low-rated content
    if (this.data.vote_average < 3.0 && age < 16) {
      return false;
    }

    return true;
  }

  // 🧠 BUSINESS LOGIC: Release status
  getReleaseStatus(): "upcoming" | "recent" | "classic" | "vintage" {
    const releaseDate = new Date(this.data.release_date);
    const now = new Date();
    const monthsAgo = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (releaseDate > now) return "upcoming";
    if (monthsAgo <= 6) return "recent";
    if (monthsAgo <= 60) return "classic"; // 5 years
    return "vintage";
  }

  // 🧠 BUSINESS LOGIC: Revenue performance
  getRevenuePerformance(): "blockbuster" | "profitable" | "break-even" | "flop" | "unknown" {
    if (!this.data.budget || !this.data.revenue) {
      return "unknown";
    }

    const profitRatio = this.data.revenue / this.data.budget;

    if (profitRatio >= 5.0) return "blockbuster";
    if (profitRatio >= 2.0) return "profitable";
    if (profitRatio >= 0.8) return "break-even";
    return "flop";
  }

  // 🔍 VALIDATION: Check if movie meets rating criteria
  meetsRatingCriteria(minRating: number): boolean {
    return this.data.vote_average >= minRating && this.data.vote_count >= 10;
  }

  // 🔍 VALIDATION: Check if movie has specific genre
  hasGenre(genreName: string): boolean {
    const genreMap = {
      Action: 28,
      Adventure: 12,
      Animation: 16,
      Comedy: 35,
      Crime: 80,
      Documentary: 99,
      Drama: 18,
      Family: 10751,
      Fantasy: 14,
      History: 36,
      Horror: 27,
      Music: 10402,
      Mystery: 9648,
      Romance: 10749,
      "Science Fiction": 878,
      "TV Movie": 10770,
      Thriller: 53,
      War: 10752,
      Western: 37
    };

    const genreId = genreMap[genreName];
    return genreId ? this.data.genre_ids.includes(genreId) : false;
  }

  // 🔍 VALIDATION: Check if movie is from specific year
  isFromYear(year: number): boolean {
    const movieYear = new Date(this.data.release_date).getFullYear();
    return movieYear === year;
  }

  // 🔄 DATA TRANSFORMATION: Get formatted display data
  getDisplayData() {
    return {
      id: this.data.id,
      title: this.sanitizeTitle(),
      year: this.getYear(),
      rating: this.getFormattedRating(),
      duration: this.getFormattedDuration(),
      description: this.getTruncatedOverview(),
      posterUrl: this.getPosterUrl(),
      backdropUrl: this.getBackdropUrl(),
      genres: this.getGenreNames(),
      popularity: this.getFormattedPopularity(),
      releaseStatus: this.getReleaseStatus(),
      ratingClass: this.getRatingClass(),
      popularityTier: this.getPopularityTier()
    };
  }

  // 🔄 DATA TRANSFORMATION: Get search-optimized data
  getSearchData() {
    return {
      id: this.data.id,
      searchableText: `${this.data.title} ${this.data.overview} ${this.getGenreNames().join(" ")}`.toLowerCase(),
      title: this.data.title,
      year: this.getYear(),
      rating: this.data.vote_average,
      popularity: this.data.popularity
    };
  }

  // 🔄 DATA TRANSFORMATION: Sanitize title
  private sanitizeTitle(): string {
    return this.data.title
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML
      .substring(0, 100); // Limit length
  }

  // 🔄 DATA TRANSFORMATION: Get formatted rating
  private getFormattedRating(): string {
    const rating = this.data.vote_average;
    const voteCount = this.data.vote_count;

    if (voteCount < 10) {
      return "Not enough ratings";
    }

    return `${rating.toFixed(1)}/10 (${voteCount.toLocaleString()} votes)`;
  }

  // 🔄 DATA TRANSFORMATION: Get formatted duration
  private getFormattedDuration(): string {
    if (!this.data.runtime) {
      return "Duration unknown";
    }

    const hours = Math.floor(this.data.runtime / 60);
    const minutes = this.data.runtime % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  }

  // 🔄 DATA TRANSFORMATION: Get truncated overview
  private getTruncatedOverview(maxLength: number = 200): string {
    if (!this.data.overview) {
      return "No description available";
    }

    if (this.data.overview.length <= maxLength) {
      return this.data.overview;
    }

    return this.data.overview.substring(0, maxLength).trim() + "...";
  }

  // 🔄 DATA TRANSFORMATION: Get poster URL
  getPosterUrl(size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string {
    if (!this.data.poster_path) {
      return "/images/no-poster-placeholder.jpg";
    }

    return `https://image.tmdb.org/t/p/${size}${this.data.poster_path}`;
  }

  // 🔄 DATA TRANSFORMATION: Get backdrop URL
  getBackdropUrl(size: "w300" | "w780" | "w1280" | "original" = "w1280"): string {
    if (!this.data.backdrop_path) {
      return "/images/no-backdrop-placeholder.jpg";
    }

    return `https://image.tmdb.org/t/p/${size}${this.data.backdrop_path}`;
  }

  // 🔄 DATA TRANSFORMATION: Get year from release date
  private getYear(): number {
    return new Date(this.data.release_date).getFullYear();
  }

  // 🔄 DATA TRANSFORMATION: Get genre names
  private getGenreNames(): string[] {
    const genreMap = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Science Fiction",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western"
    };

    return this.data.genre_ids.map((id) => genreMap[id]).filter(Boolean);
  }

  // 🔄 DATA TRANSFORMATION: Get formatted popularity
  private getFormattedPopularity(): string {
    const pop = this.data.popularity;
    if (pop >= 1000) {
      return `${(pop / 1000).toFixed(1)}K`;
    }
    return pop.toFixed(0);
  }

  // 🛡️ DATA INTEGRITY: Validate and sanitize movie data
  private validateAndSanitize(): void {
    // Ensure required fields
    if (!this.data.id || !this.data.title) {
      throw new Error("Movie must have ID and title");
    }

    // Sanitize numeric values
    this.data.vote_average = Math.max(0, Math.min(10, this.data.vote_average || 0));
    this.data.vote_count = Math.max(0, this.data.vote_count || 0);
    this.data.popularity = Math.max(0, this.data.popularity || 0);

    // Sanitize arrays
    this.data.genre_ids = this.data.genre_ids || [];

    // Sanitize strings
    this.data.title = this.data.title.trim();
    this.data.overview = (this.data.overview || "").trim();

    // Validate release date
    if (this.data.release_date) {
      const releaseDate = new Date(this.data.release_date);
      if (isNaN(releaseDate.getTime())) {
        this.data.release_date = "";
      }
    }
  }

  // 🔍 VALIDATION: Static validation methods
  static isValidMovieData(data: any): data is MovieData {
    return (
      data &&
      typeof data.id === "number" &&
      typeof data.title === "string" &&
      data.title.length > 0 &&
      typeof data.vote_average === "number" &&
      Array.isArray(data.genre_ids)
    );
  }

  // Getters for controlled access
  get id(): number {
    return this.data.id;
  }
  get title(): string {
    return this.data.title;
  }
  get overview(): string {
    return this.data.overview;
  }
  get releaseDate(): string {
    return this.data.release_date;
  }
  get rating(): number {
    return this.data.vote_average;
  }
  get voteCount(): number {
    return this.data.vote_count;
  }
  get popularity(): number {
    return this.data.popularity;
  }
  get genreIds(): number[] {
    return [...this.data.genre_ids];
  }
  get isAdult(): boolean {
    return this.data.adult;
  }
  get originalLanguage(): string {
    return this.data.original_language;
  }

  // Method to get raw data (for API calls, etc.)
  toJSON(): MovieData {
    return { ...this.data };
  }
}
```

### **Movie Collection Model**

```typescript
// src/features/movies/models/MovieCollection.ts
export class MovieCollection {
  private movies: Movie[] = [];

  constructor(movieDataArray: MovieData[] = []) {
    this.movies = movieDataArray.filter(Movie.isValidMovieData).map((data) => new Movie(data));
  }

  // 🧠 BUSINESS LOGIC: Get top-rated movies
  getTopRated(limit: number = 10): Movie[] {
    return this.movies
      .filter((movie) => movie.voteCount >= 100) // Minimum votes for credibility
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // 🧠 BUSINESS LOGIC: Get trending movies
  getTrending(limit: number = 10): Movie[] {
    return this.movies
      .filter((movie) => movie.getReleaseStatus() === "recent")
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // 🧠 BUSINESS LOGIC: Get movies by genre
  getByGenre(genreName: string, limit: number = 20): Movie[] {
    return this.movies
      .filter((movie) => movie.hasGenre(genreName))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // 🧠 BUSINESS LOGIC: Get personalized recommendations
  getRecommendations(userAge: number, preferredGenres: string[], limit: number = 10): Movie[] {
    return this.movies
      .filter((movie) => {
        // Age appropriateness
        if (!movie.isAppropriateForAge(userAge)) return false;

        // Has preferred genres
        if (preferredGenres.length > 0) {
          return preferredGenres.some((genre) => movie.hasGenre(genre));
        }

        return true;
      })
      .sort((a, b) => {
        // Prefer higher rated movies
        const ratingDiff = b.rating - a.rating;
        if (Math.abs(ratingDiff) > 1) return ratingDiff;

        // Then by popularity
        return b.popularity - a.popularity;
      })
      .slice(0, limit);
  }

  // 🔍 BUSINESS LOGIC: Search movies
  search(
    query: string,
    options: {
      minRating?: number;
      genres?: string[];
      yearRange?: { start: number; end: number };
      ageRestriction?: number;
    } = {}
  ): Movie[] {
    const searchTerm = query.toLowerCase().trim();

    return this.movies
      .filter((movie) => {
        // Text search
        const searchData = movie.getSearchData();
        if (!searchData.searchableText.includes(searchTerm)) {
          return false;
        }

        // Rating filter
        if (options.minRating && !movie.meetsRatingCriteria(options.minRating)) {
          return false;
        }

        // Genre filter
        if (options.genres && options.genres.length > 0) {
          if (!options.genres.some((genre) => movie.hasGenre(genre))) {
            return false;
          }
        }

        // Year range filter
        if (options.yearRange) {
          const movieYear = new Date(movie.releaseDate).getFullYear();
          if (movieYear < options.yearRange.start || movieYear > options.yearRange.end) {
            return false;
          }
        }

        // Age restriction
        if (options.ageRestriction && !movie.isAppropriateForAge(options.ageRestriction)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by relevance (title matches first, then rating)
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        const aTitleMatch = aTitle.includes(searchTerm);
        const bTitleMatch = bTitle.includes(searchTerm);

        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;

        // Then by rating
        return b.rating - a.rating;
      });
  }

  // 🔄 DATA TRANSFORMATION: Get statistics
  getStatistics() {
    if (this.movies.length === 0) {
      return {
        total: 0,
        averageRating: 0,
        totalVotes: 0,
        genreDistribution: {},
        ratingDistribution: {},
        releaseYearRange: null
      };
    }

    const ratings = this.movies.map((m) => m.rating);
    const years = this.movies.map((m) => new Date(m.releaseDate).getFullYear()).filter((year) => !isNaN(year));

    // Genre distribution
    const genreDistribution = {};
    this.movies.forEach((movie) => {
      movie.genreIds.forEach((genreId) => {
        genreDistribution[genreId] = (genreDistribution[genreId] || 0) + 1;
      });
    });

    // Rating distribution
    const ratingDistribution = {
      excellent: this.movies.filter((m) => m.getRatingClass() === "excellent").length,
      good: this.movies.filter((m) => m.getRatingClass() === "good").length,
      average: this.movies.filter((m) => m.getRatingClass() === "average").length,
      poor: this.movies.filter((m) => m.getRatingClass() === "poor").length
    };

    return {
      total: this.movies.length,
      averageRating: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      totalVotes: this.movies.reduce((sum, movie) => sum + movie.voteCount, 0),
      genreDistribution,
      ratingDistribution,
      releaseYearRange: {
        earliest: Math.min(...years),
        latest: Math.max(...years)
      }
    };
  }

  // Collection manipulation methods
  addMovie(movieData: MovieData): boolean {
    if (!Movie.isValidMovieData(movieData)) {
      return false;
    }

    // Check for duplicates
    if (this.movies.some((movie) => movie.id === movieData.id)) {
      return false;
    }

    this.movies.push(new Movie(movieData));
    return true;
  }

  removeMovie(movieId: number): boolean {
    const index = this.movies.findIndex((movie) => movie.id === movieId);
    if (index === -1) return false;

    this.movies.splice(index, 1);
    return true;
  }

  // Getters
  get length(): number {
    return this.movies.length;
  }
  get isEmpty(): boolean {
    return this.movies.length === 0;
  }
  get all(): Movie[] {
    return [...this.movies];
  }

  // Convert to array for external use
  toArray(): Movie[] {
    return [...this.movies];
  }
}
```

## 🔐 **User Model Examples**

```typescript
// src/features/users/models/User.ts
export interface UserData {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  role: "user" | "admin" | "moderator";
  preferences: {
    favoriteGenres: string[];
    preferredLanguage: string;
    adultContent: boolean;
    notifications: boolean;
  };
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export class User {
  private data: UserData;

  constructor(userData: UserData) {
    this.data = { ...userData };
    this.validateAndSanitize();
  }

  // 🧠 BUSINESS LOGIC: Calculate user age
  getAge(): number {
    const birthDate = new Date(this.data.dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // 🧠 BUSINESS LOGIC: Check if user can view adult content
  canViewAdultContent(): boolean {
    return this.getAge() >= 18 && this.data.preferences.adultContent;
  }

  // 🧠 BUSINESS LOGIC: Get user's account tenure
  getAccountTenure(): { years: number; months: number; days: number } {
    const createdDate = new Date(this.data.createdAt);
    const today = new Date();

    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    return { years, months, days };
  }

  // 🧠 BUSINESS LOGIC: Check if user is recently active
  isRecentlyActive(daysThreshold: number = 30): boolean {
    if (!this.data.lastLoginAt) return false;

    const lastLogin = new Date(this.data.lastLoginAt);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysThreshold);

    return lastLogin >= threshold;
  }

  // 🧠 BUSINESS LOGIC: Get user permission level
  getPermissionLevel(): number {
    switch (this.data.role) {
      case "admin":
        return 100;
      case "moderator":
        return 50;
      case "user":
        return 10;
      default:
        return 0;
    }
  }

  // 🧠 BUSINESS LOGIC: Check if user can perform action
  canPerformAction(requiredLevel: number): boolean {
    return this.data.isActive && this.getPermissionLevel() >= requiredLevel;
  }

  // 🔄 DATA TRANSFORMATION: Get display name
  getDisplayName(): string {
    const fullName = `${this.data.firstName} ${this.data.lastName}`.trim();
    return fullName || this.data.username;
  }

  // 🔄 DATA TRANSFORMATION: Get user initials
  getInitials(): string {
    const firstName = this.data.firstName?.charAt(0)?.toUpperCase() || "";
    const lastName = this.data.lastName?.charAt(0)?.toUpperCase() || "";

    if (firstName && lastName) {
      return firstName + lastName;
    }

    if (firstName) {
      return firstName + (this.data.username?.charAt(1)?.toUpperCase() || "");
    }

    return this.data.username?.substring(0, 2)?.toUpperCase() || "U";
  }

  // 🔄 DATA TRANSFORMATION: Get public profile data
  getPublicProfile() {
    return {
      id: this.data.id,
      username: this.data.username,
      displayName: this.getDisplayName(),
      initials: this.getInitials(),
      role: this.data.role,
      memberSince: this.data.createdAt,
      tenure: this.getAccountTenure(),
      isActive: this.data.isActive && this.isRecentlyActive()
    };
  }

  // 🔄 DATA TRANSFORMATION: Get recommendation preferences
  getRecommendationProfile() {
    return {
      age: this.getAge(),
      favoriteGenres: this.data.preferences.favoriteGenres,
      preferredLanguage: this.data.preferences.preferredLanguage,
      canViewAdult: this.canViewAdultContent(),
      permissionLevel: this.getPermissionLevel()
    };
  }

  // 🔍 VALIDATION: Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 🔍 VALIDATION: Validate username
  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  // 🛡️ DATA INTEGRITY: Validate and sanitize user data
  private validateAndSanitize(): void {
    // Required fields validation
    if (!this.data.id || !this.data.email || !this.data.username) {
      throw new Error("User must have ID, email, and username");
    }

    // Email validation
    if (!this.isValidEmail(this.data.email)) {
      throw new Error("Invalid email format");
    }

    // Username validation
    if (!this.isValidUsername(this.data.username)) {
      throw new Error("Invalid username format");
    }

    // Sanitize strings
    this.data.email = this.data.email.toLowerCase().trim();
    this.data.username = this.data.username.toLowerCase().trim();
    this.data.firstName = (this.data.firstName || "").trim();
    this.data.lastName = (this.data.lastName || "").trim();

    // Validate role
    const validRoles = ["user", "admin", "moderator"];
    if (!validRoles.includes(this.data.role)) {
      this.data.role = "user";
    }

    // Ensure preferences exist
    this.data.preferences = {
      favoriteGenres: [],
      preferredLanguage: "en",
      adultContent: false,
      notifications: true,
      ...this.data.preferences
    };

    // Validate date of birth
    const birthDate = new Date(this.data.dateOfBirth);
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      throw new Error("Invalid date of birth");
    }

    // Validate created date
    const createdDate = new Date(this.data.createdAt);
    if (isNaN(createdDate.getTime())) {
      this.data.createdAt = new Date().toISOString();
    }
  }

  // Update methods with validation
  updateEmail(newEmail: string): boolean {
    if (!this.isValidEmail(newEmail)) {
      return false;
    }
    this.data.email = newEmail.toLowerCase().trim();
    return true;
  }

  updatePreferences(newPreferences: Partial<UserData["preferences"]>): void {
    this.data.preferences = {
      ...this.data.preferences,
      ...newPreferences
    };
  }

  updateLastLogin(): void {
    this.data.lastLoginAt = new Date().toISOString();
  }

  // Getters for controlled access
  get id(): number {
    return this.data.id;
  }
  get email(): string {
    return this.data.email;
  }
  get username(): string {
    return this.data.username;
  }
  get firstName(): string {
    return this.data.firstName;
  }
  get lastName(): string {
    return this.data.lastName;
  }
  get role(): string {
    return this.data.role;
  }
  get isActive(): boolean {
    return this.data.isActive;
  }
  get preferences(): UserData["preferences"] {
    return { ...this.data.preferences };
  }

  // Convert to JSON for API calls
  toJSON(): UserData {
    return { ...this.data };
  }
}
```

## 🛒 **E-commerce Product Model**

```typescript
// src/features/products/models/Product.ts
export interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  sku: string;
  stock: number;
  images: string[];
  ratings: {
    average: number;
    count: number;
  };
  specifications: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export class Product {
  private data: ProductData;

  constructor(productData: ProductData) {
    this.data = { ...productData };
    this.validateAndSanitize();
  }

  // 🧠 BUSINESS LOGIC: Calculate discount percentage
  getDiscountPercentage(): number {
    if (!this.data.discountPrice || this.data.discountPrice >= this.data.price) {
      return 0;
    }

    return Math.round(((this.data.price - this.data.discountPrice) / this.data.price) * 100);
  }

  // 🧠 BUSINESS LOGIC: Get effective price
  getEffectivePrice(): number {
    return this.data.discountPrice && this.data.discountPrice < this.data.price
      ? this.data.discountPrice
      : this.data.price;
  }

  // 🧠 BUSINESS LOGIC: Check if product is on sale
  isOnSale(): boolean {
    return this.getDiscountPercentage() > 0;
  }

  // 🧠 BUSINESS LOGIC: Check stock availability
  isInStock(): boolean {
    return this.data.stock > 0 && this.data.isActive;
  }

  // 🧠 BUSINESS LOGIC: Check if low stock
  isLowStock(threshold: number = 10): boolean {
    return this.data.stock <= threshold && this.data.stock > 0;
  }

  // 🧠 BUSINESS LOGIC: Get stock status
  getStockStatus(): "in-stock" | "low-stock" | "out-of-stock" | "discontinued" {
    if (!this.data.isActive) return "discontinued";
    if (this.data.stock === 0) return "out-of-stock";
    if (this.isLowStock()) return "low-stock";
    return "in-stock";
  }

  // 🧠 BUSINESS LOGIC: Get rating quality
  getRatingQuality(): "excellent" | "good" | "average" | "poor" | "no-ratings" {
    if (this.data.ratings.count === 0) return "no-ratings";

    const avg = this.data.ratings.average;
    if (avg >= 4.5) return "excellent";
    if (avg >= 3.5) return "good";
    if (avg >= 2.5) return "average";
    return "poor";
  }

  // 🧠 BUSINESS LOGIC: Calculate savings amount
  getSavingsAmount(): number {
    if (!this.isOnSale()) return 0;
    return this.data.price - this.getEffectivePrice();
  }

  // 🔄 DATA TRANSFORMATION: Get display data
  getDisplayData() {
    return {
      id: this.data.id,
      name: this.data.name,
      shortDescription: this.getShortDescription(),
      originalPrice: this.data.price,
      effectivePrice: this.getEffectivePrice(),
      discountPercentage: this.getDiscountPercentage(),
      savingsAmount: this.getSavingsAmount(),
      isOnSale: this.isOnSale(),
      stockStatus: this.getStockStatus(),
      stockCount: this.data.stock,
      rating: this.getFormattedRating(),
      ratingQuality: this.getRatingQuality(),
      mainImage: this.getMainImage(),
      category: this.data.category,
      brand: this.data.brand
    };
  }

  // 🔄 DATA TRANSFORMATION: Get short description
  private getShortDescription(maxLength: number = 150): string {
    if (this.data.description.length <= maxLength) {
      return this.data.description;
    }

    return this.data.description.substring(0, maxLength).trim() + "...";
  }

  // 🔄 DATA TRANSFORMATION: Get formatted rating
  private getFormattedRating(): string {
    if (this.data.ratings.count === 0) {
      return "No ratings yet";
    }

    return `${this.data.ratings.average.toFixed(1)}/5 (${this.data.ratings.count.toLocaleString()} reviews)`;
  }

  // 🔄 DATA TRANSFORMATION: Get main image
  getMainImage(): string {
    return this.data.images.length > 0 ? this.data.images[0] : "/images/no-product-image.jpg";
  }

  // 🔍 VALIDATION: Check if quantity is available
  canPurchaseQuantity(quantity: number): boolean {
    return quantity > 0 && quantity <= this.data.stock && this.isInStock();
  }

  // 🛡️ DATA INTEGRITY: Validate and sanitize
  private validateAndSanitize(): void {
    if (!this.data.id || !this.data.name || !this.data.sku) {
      throw new Error("Product must have ID, name, and SKU");
    }

    // Sanitize price
    this.data.price = Math.max(0, this.data.price || 0);
    if (this.data.discountPrice) {
      this.data.discountPrice = Math.max(0, this.data.discountPrice);
    }

    // Sanitize stock
    this.data.stock = Math.max(0, Math.floor(this.data.stock || 0));

    // Sanitize strings
    this.data.name = this.data.name.trim();
    this.data.description = (this.data.description || "").trim();
    this.data.category = (this.data.category || "Uncategorized").trim();
    this.data.brand = (this.data.brand || "Unknown").trim();

    // Ensure arrays exist
    this.data.images = this.data.images || [];

    // Sanitize ratings
    this.data.ratings = {
      average: Math.max(0, Math.min(5, this.data.ratings?.average || 0)),
      count: Math.max(0, Math.floor(this.data.ratings?.count || 0))
    };
  }

  // Getters
  get id(): number {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get price(): number {
    return this.data.price;
  }
  get stock(): number {
    return this.data.stock;
  }
  get category(): string {
    return this.data.category;
  }
  get brand(): string {
    return this.data.brand;
  }
  get sku(): string {
    return this.data.sku;
  }

  // Convert to JSON
  toJSON(): ProductData {
    return { ...this.data };
  }
}
```

## 🎯 **Model Benefits**

### **1. Business Logic Encapsulation**

- ✅ All business rules are centralized in models
- ✅ Easy to test business logic independently
- ✅ Consistent behavior across the application

### **2. Data Integrity**

- ✅ Validation ensures data consistency
- ✅ Sanitization prevents data corruption
- ✅ Type safety with proper interfaces

### **3. Domain Knowledge**

- ✅ Models represent real-world entities
- ✅ Business calculations are domain-specific
- ✅ Easy to understand and maintain

### **4. Reusability**

- ✅ Same models work across different UI components
- ✅ Business logic doesn't depend on UI framework
- ✅ Easy to share between frontend and backend

## ✅ **Model Checklist**

Models should:

- ✅ **Encapsulate** business logic and domain rules
- ✅ **Validate** and sanitize input data
- ✅ **Transform** data for different use cases
- ✅ **Maintain** data integrity and consistency
- ✅ **Provide** controlled access to data

Models should NOT:

- ❌ **Make** API calls (that's Services)
- ❌ **Handle** UI events (that's Controllers)
- ❌ **Render** UI components (that's Views)
- ❌ **Manage** application state (that's Controllers)
- ❌ **Perform** I/O operations (that's Services)

Models are the **brain** of your application! 🧠
