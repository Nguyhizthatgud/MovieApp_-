
// Security API Configuration
export const SECURITY_CONFIG = {

    // req security
    MAX_REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second

    // rate limitation
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    RATE_LIMIT_MAX_REQUESTS: 100,

    // content security
    ALLOWED_IMAGE_DOMAINS: [
        'image.tmdb.org',
        'themoviedb.org'
    ],

    // input Validation
    MAX_SEARCH_LENGTH: 100,
    MIN_SEARCH_LENGTH: 2,
    MAX_PAGE_NUMBER: 1000
};


export const API_CONFIG = {
    VITE_TMDB_BASE_URL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    VITE_TMDB_IMAGE_BASE_URL: import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
    VITE_TMDB_FAVORITE_BASE_URL: import.meta.env.VITE_TMDB_FAVORITE_BASE_URL || 'https://api.themoviedb.org/3/account',
    // Use environment variables in production for security
    API_KEY: import.meta.env.VITE_TMDB_API_KEY,
    ACCESS_TOKEN: import.meta.env.VITE_TMDB_ACCESS_TOKEN,
};


export const DEFAULT_OPTIONS = {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
    },
    timeout: SECURITY_CONFIG.MAX_REQUEST_TIMEOUT,
    credentials: 'same-origin' // Important for CSRF protection
};

/**
 * 🎯 API Endpoints Configuration
 */
export const ENDPOINTS = {
    // Movie endpoints
    POPULAR_MOVIES: `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/popular`,
    TOP_RATED_MOVIES: `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/top_rated`,
    NOW_PLAYING_MOVIES: `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/now_playing`,
    UPCOMING_MOVIES: `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/upcoming`,
    GENRE_MOVIES: (genreId) => `${API_CONFIG.VITE_TMDB_BASE_URL}/discover/movie?with_genres=${genreId}`,
    MOVIE_DETAILS: (id) => `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/${id}`,
    MOVIE_CREDITS: (id) => `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/${id}/credits`,
    MOVIE_VIDEOS: (id) => `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/${id}/videos`,
    MOVIE_REVIEWS: (id) => `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/${id}/reviews`,
    MOVIE_RECOMMENDATIONS: (id) => `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/${id}/recommendations`,
    MOVIE_CAST_AND_CREW: (id) => `${API_CONFIG.VITE_TMDB_BASE_URL}/movie/${id}/credits`,
    POST_FAVORITE_MOVIES: (accountId) => `${API_CONFIG.VITE_TMDB_FAVORITE_BASE_URL}/${accountId}/favorite`,
    GET_FAVORITE_MOVIES: (accountId) => `${API_CONFIG.VITE_TMDB_FAVORITE_BASE_URL}/${accountId}/favorite/movies?&sort_by=created_at.asc`,


    // Search endpoints
    SEARCH_MOVIES: `${API_CONFIG.VITE_TMDB_BASE_URL}/search/movie`,
    SEARCH_MULTI: `${API_CONFIG.VITE_TMDB_BASE_URL}/search/multi`,

    // Genre endpoints
    MOVIE_GENRES: `${API_CONFIG.VITE_TMDB_BASE_URL}/genre/movie/list`,
    MOVIE_TV_GENRES: `${API_CONFIG.VITE_TMDB_BASE_URL}/genre/tv/list`,

    // Discovery endpoints
    DISCOVER_MOVIES: `${API_CONFIG.VITE_TMDB_BASE_URL}/discover/movie`
};




// Export everything for easy access
export default {
    API_CONFIG, // API configuration
    SECURITY_CONFIG, // Security configuration
    DEFAULT_OPTIONS, // Default options for API requests
    ENDPOINTS // API endpoints
};