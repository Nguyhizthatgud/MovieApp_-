import React from 'react';
import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../../shared/api/config.js';
export const useSearchMovie = (searchValue, debounce = 300) => {
    const [searchResults, setSearchResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        if (!searchValue || searchValue.trim().length < 2) {
            setSearchResults([]);
            setError(null);
            return;
        }
        // debounce ngay và luôn
        const searchMovies = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios({
                    method: 'GET',
                    url: `${ENDPOINTS.SEARCH_MOVIES}`,
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
                        'Accept': 'application/json'
                    },
                    params: {
                        query: searchValue.trim(),
                        language: 'en-US',
                        page: 1,
                        include_adult: false
                    }
                });
                const movieResults = response.data.results?.slice(0, 8) || [];
                setSearchResults(movieResults);
                console.log('Searching movies for:', movieResults);
            } catch (error) {
                setError(error.message || 'Failed to fetch search results');
                setSearchResults([]);
            }
            finally {
                setLoading(false);
            }
        }, debounce); // debounce 500ms

        return () => clearTimeout(searchMovies);
    }, [searchValue, debounce]);
    const clearSearch = React.useCallback(() => {
        setSearchResults([]);
        setError(null);
    }, []);

    return { searchResults, loading, error, clearSearch };
};
