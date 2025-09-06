import axios from 'axios';

// Create axios instance with TMDB configuration
const tmdbApi = axios.create({
    baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
        'Accept': 'application/json'
    }
});

// Request interceptor
tmdbApi.interceptors.request.use(
    (config) => {
        console.log(`🚀 Making ${config.method?.toUpperCase()} request to:`, config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
tmdbApi.interceptors.response.use(
    (response) => {
        console.log(`✅ Response received:`, response.status, response.statusText);
        return response;
    },
    (error) => {
        console.error('❌ Response error:', error.response?.status, error.response?.statusText);

        // Handle common errors
        if (error.response?.status === 401) {
            console.error('🔑 Authentication failed - check your API key');
        } else if (error.response?.status === 404) {
            console.error('🔍 Resource not found');
        } else if (error.response?.status >= 500) {
            console.error('🔥 Server error occurred');
        }

        return Promise.reject(error);
    }
);

export default tmdbApi;
