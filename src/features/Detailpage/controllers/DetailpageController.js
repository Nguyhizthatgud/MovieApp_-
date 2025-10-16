import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    API_CONFIG,
    SECURITY_CONFIG,
    ENDPOINTS,
    getDefaultHeaders,
    getDefaultOptions,
    buildUrl,
    apiRequest
} from '../../../shared/api/config.js'
import axios from 'axios'
export const useDetailPage = (params) => {
    const [movie, setMovie] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)
    const [video, setVideo] = useState([]);
    const [cast, setCast] = useState([]);
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiRequest(ENDPOINTS.MOVIE_DETAILS(params));
                setMovie(response.data);
            } catch (error) {
                setError(error.message || 'Failed to fetch movie details');
                setLoading(false);
            }
        }
        fetchDetails();
    }, [params]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await apiRequest(ENDPOINTS.MOVIE_VIDEOS(params));
                setVideo(response.data.results);
            } catch (error) {
                setError(error.message || 'Failed to fetch movie videos');
                setLoading(false);
            }
        }
        fetchVideos();
    }, [params]);

    useEffect(() => {
        const fetchCast = async () => {
            try {
                const response = await apiRequest(ENDPOINTS.MOVIE_CAST_AND_CREW(params));
                setCast(response.data.cast);
            } catch (error) {
                setError(error.message || 'Failed to fetch movie cast');
                setLoading(false);
            }
        }
        fetchCast();
    }, [params]);

    return {
        movie,
        cast,
        loading,
        video,
        error
    }
};

export const useFavorite = (params) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // check favorite movie status on mount 
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!params) return;

            try {
                setLoading(true);
                setError(null);

                const response = await apiRequest(ENDPOINTS.GET_FAVORITE_MOVIES(accountId));
                setFavoriteMovies(response.data.results || []);
                // check if current movie is in favorites
                const isFav = response.data.results.some(movie => movie.id === parseInt(params));
                setIsFavorite(isFav);
            } catch (error) {
                setError(error.message || 'Failed to check favorite status');
            } finally {
                setLoading(false);
            }
        };
        checkFavoriteStatus();
    }, [params, accountId]);

    //add favorite movie
    const addFavorite = async (accountId, movieId) => {
        if (!params) return;
        try {
            setLoading(true);
            setError(null);
            const response = await apiRequest(ENDPOINTS.POST_FAVORITE_MOVIES(accountId), {
                method: 'POST',
                body: JSON.stringify({
                    media_type: 'movie',
                    media_id: movieId,
                    favorite: true
                })
            });
            setIsFavorite(true);
            return response.data;
        } catch (error) {
            setError(error.message || 'Failed to add movie to favorites');
        } finally {
            setLoading(false);
        }
    };

    // remove favorite movie
    const removeFavorite = async (accountId, movieId) => {
        if (!params) return;
        try {
            setLoading(true);
            setError(null);
            const movieId = parseInt(params);
            const accountId = import.meta.env.VITE_ACCOUNT_ID;
            const response = await apiRequest(
                ENDPOINTS.POST_FAVORITE_MOVIES(accountId),
                {
                    method: 'POST',
                    body: JSON.stringify({
                        media_type: 'movie',
                        media_id: movieId,
                        favorite: false
                    })
                }
            )
            setIsFavorite(false);
            return response.data;
        } catch (error) {
            setError(error.message || 'Failed to remove movie from favorites');
        } finally {
            setLoading(false);
        }
    }
    //handle favorite button behavior
    const handleFavoriteToggle = async () => {
        if (isFavorite) {
            return await removeFavorite();
            api.success({
                message: "Xoá khỏi danh sách yêu thích!",
                description: `Đã xoá ${movie.title} khỏi danh sách yêu thích!`,
                placement: "topRight"
            });
        } else {
            return await addFavorite();
        }
    };
    // get favorite movies list
    const getFavoriteMovies = async () => {
        try {
            const response = await axios.get(
                ENDPOINTS.GET_FAVORITE_MOVIES(accountId),
                {
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`, 'Content-Type': 'application/json'

                    }
                }
            )
            const favoriteMovies = response.data.results;
            setFavoriteMovies(favoriteMovies);
        } catch (error) {
            setError(error.message || 'Failed to check favorite status');
            setLoading(false);
        }
    }

    return {
        isFavorite,       // Favorite status
        addFavorite,   // Function to add favorite
        removeFavorite, // Function to remove favorite
        getFavoriteMovies, // Function to get favorite movies
        handleFavoriteToggle, // Function to toggle favorite status
        favoriteMovies, // List of favorite movies
        loading,      // Loading state
        error     // Error state
    }
};

