// src/features/Homepage/models/Movie.js
export class Movie {
    constructor(movieData) {
        this.data = { ...movieData };
        this.validateAndSanitize();
    }

    // BUSINESS LOGIC: Movie rating classification
    getRatingClass() {
        const rating = this.data.vote_average;
        if (rating >= 8.5) return 'excellent';
        if (rating >= 7.0) return 'good';
        if (rating >= 5.0) return 'average';
        return 'poor';
    }

    // BUSINESS LOGIC: Get formatted rating
    getFormattedRating() {
        return this.data.vote_average?.toFixed(1) || 'N/A';
    }

    // BUSINESS LOGIC: Get release year
    getReleaseYear() {
        if (!this.data.release_date) return 'Unknown';
        return new Date(this.data.release_date).getFullYear();
    }

    //  DATA TRANSFORMATION: Get truncated overview
    getTruncatedOverview(maxLength = 150) {
        if (!this.data.overview) return 'No description available';

        if (this.data.overview.length <= maxLength) {
            return this.data.overview;
        }

        return this.data.overview.substring(0, maxLength) + '...';
    }

    // DATA TRANSFORMATION: Get poster URL
    getPosterUrl(size = 'w500') {
        if (!this.data.poster_path) {
            return '/images/no-poster-placeholder.jpg';
        }
        return `https://image.tmdb.org/t/p/${size}${this.data.poster_path}`;
    }

    // DATA TRANSFORMATION: Get backdrop URL
    getBackdropUrl(size = 'w1280') {
        if (!this.data.backdrop_path) {
            return '/images/no-backdrop-placeholder.jpg';
        }
        return `https://image.tmdb.org/t/p/${size}${this.data.backdrop_path}`;
    }

    // DATA TRANSFORMATION: Get display data for UI
    getDisplayData() {
        return {
            id: this.data.id,
            title: this.data.title,
            overview: this.getTruncatedOverview(),
            fullOverview: this.data.overview,
            rating: this.getFormattedRating(),
            ratingClass: this.getRatingClass(),
            year: this.getReleaseYear(),
            posterUrl: this.getPosterUrl(),
            backdropUrl: this.getBackdropUrl(),
            releaseDate: this.data.release_date
        };
    }

    // DATA INTEGRITY: Validate and sanitize movie data
    validateAndSanitize() {
        if (!this.data.id || !this.data.title) {
            throw new Error('Movie must have ID and title');
        }

        // Sanitize numeric values
        this.data.vote_average = Math.max(0, Math.min(10, this.data.vote_average || 0));

        // Sanitize strings
        this.data.title = (this.data.title || '').trim();
        this.data.overview = (this.data.overview || '').trim();
    }

    // Getters for controlled access
    get id() { return this.data.id; }
    get title() { return this.data.title; }
    get overview() { return this.data.overview; }
    get voteAverage() { return this.data.vote_average; }
    get releaseDate() { return this.data.release_date; }
    get posterPath() { return this.data.poster_path; }
    get backdropPath() { return this.data.backdrop_path; }

    // Convert to JSON for API calls
    toJSON() {
        return { ...this.data };
    }
}
