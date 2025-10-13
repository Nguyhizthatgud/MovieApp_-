import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../../../shared/api/config.js';

export const useFavoriteMovies = () => {
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalResults: 0
    });

    const accountId = import.meta.env.VITE_ACCOUNT_ID;

    // Get all favorite movies
    const getFavoriteMovies = async (page = 1) => {
        if (!accountId) {
            setError('Account ID not found');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `${ENDPOINTS.GET_FAVORITE_MOVIES(accountId)}?page=${page}&sort_by=created_at.desc`,
                {
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setFavoriteMovies(response.data.results || []);
            setPagination({
                page: response.data.page,
                totalPages: response.data.total_pages,
                totalResults: response.data.total_results
            });

            console.log('Favorite movies loaded:', response.data);

        } catch (error) {
            console.error('Error fetching favorite movies:', error);
            setError(error.message || 'Failed to load favorite movies');
        } finally {
            setLoading(false);
        }
    };

    // Remove movie from favorites
    const removeFromFavorites = async (movieId) => {
        try {
            setLoading(true);

            const response = await axios.post(
                ENDPOINTS.POST_FAVORITE_MOVIES(accountId),
                {
                    media_type: 'movie',
                    media_id: parseInt(movieId),
                    favorite: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Remove from local state
            setFavoriteMovies(prev => prev.filter(movie => movie.id !== movieId));
            setPagination(prev => ({
                ...prev,
                totalResults: prev.totalResults - 1
            }));

            console.log('Movie removed from favorites:', response.data);
            return response.data;

        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Load favorites on mount
    useEffect(() => {
        getFavoriteMovies();
    }, [accountId]);

    return {
        favoriteMovies,
        loading,
        error,
        pagination,
        getFavoriteMovies,
        removeFromFavorites,
        refreshFavorites: () => getFavoriteMovies(pagination.page)
    };
};