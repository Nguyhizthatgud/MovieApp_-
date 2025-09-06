/**
 * Movie API Service - Handles all TMDB API calls
 */
import { buildAPIURL, DEFAULT_OPTIONS } from './config.js';

class MovieAPIService {
    constructor() {
        this.options = DEFAULT_OPTIONS;
    }

    // Generic API call method
    async apiCall(endpoint, params = {}) {
        try {
            const url = buildAPIURL(endpoint, params);
            const response = await fetch(url, this.options);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Get popular movies
    async getPopular(page = 1) {
        return this.apiCall('/movie/popular', { page });
    }

    // Get trending movies
    async getTrending(timeWindow = 'day') {
        return this.apiCall(`/trending/movie/${timeWindow}`);
    }

    // Get movie details
    async getDetails(movieId) {
        return this.apiCall(`/movie/${movieId}`);
    }

    // Search movies
    async search(query, page = 1) {
        return this.apiCall('/search/movie', {
            query: encodeURIComponent(query),
            page
        });
    }

    // Get movies by genre
    async getByGenre(genreId, page = 1) {
        return this.apiCall('/discover/movie', {
            with_genres: genreId,
            page,
            sort_by: 'popularity.desc'
        });
    }

    // Get similar movies
    async getSimilar(movieId) {
        return this.apiCall(`/movie/${movieId}/similar`);
    }

    // Get movie recommendations
    async getRecommendations(movieId) {
        return this.apiCall(`/movie/${movieId}/recommendations`);
    }

    // Get now playing movies
    async getNowPlaying(page = 1) {
        return this.apiCall('/movie/now_playing', { page });
    }

    // Get upcoming movies
    async getUpcoming(page = 1) {
        return this.apiCall('/movie/upcoming', { page });
    }

    // Get top rated movies
    async getTopRated(page = 1) {
        return this.apiCall('/movie/top_rated', { page });
    }

    // Get movie credits
    async getCredits(movieId) {
        return this.apiCall(`/movie/${movieId}/credits`);
    }

    // Get movie videos (trailers, teasers, etc.)
    async getVideos(movieId) {
        return this.apiCall(`/movie/${movieId}/videos`);
    }

    // Get movie images
    async getImages(movieId) {
        return this.apiCall(`/movie/${movieId}/images`);
    }

    // Get movie reviews
    async getReviews(movieId, page = 1) {
        return this.apiCall(`/movie/${movieId}/reviews`, { page });
    }

    // Get genres list
    async getGenres() {
        return this.apiCall('/genre/movie/list');
    }

    // Discover movies with filters
    async discover(filters = {}) {
        const params = {
            sort_by: 'popularity.desc',
            page: 1,
            ...filters
        };

        return this.apiCall('/discover/movie', params);
    }

    // Get movie keywords
    async getKeywords(movieId) {
        return this.apiCall(`/movie/${movieId}/keywords`);
    }

    // Get movie external IDs
    async getExternalIds(movieId) {
        return this.apiCall(`/movie/${movieId}/external_ids`);
    }

    // Get movie watch providers
    async getWatchProviders(movieId) {
        return this.apiCall(`/movie/${movieId}/watch/providers`);
    }

    // Advanced search with multiple filters
    async advancedSearch(searchParams) {
        const {
            query,
            year,
            primary_release_year,
            region,
            page = 1
        } = searchParams;

        const params = { page };

        if (query) params.query = encodeURIComponent(query);
        if (year) params.year = year;
        if (primary_release_year) params.primary_release_year = primary_release_year;
        if (region) params.region = region;

        return this.apiCall('/search/movie', params);
    }

    // Get configuration (for image sizes, etc.)
    async getConfiguration() {
        return this.apiCall('/configuration');
    }
}

// Export singleton instance
export const movieAPI = new MovieAPIService();
export default movieAPI;
