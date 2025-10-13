import React, { useState, useEffect } from 'react';
import { API_CONFIG, ENDPOINTS } from '../../../shared/api/config.js';
import { createHomepageData } from '../models/HomepageModel.js';
import axios from 'axios';

//controller feature movies
export const useNowPlaying = (params) => {
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    const [featuredMovies, setFeaturedMovies] = useState([]);
    const [currentMovie, setCurrentMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNowPlayingMovies = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiParams = {
                    api_key: API_CONFIG.API_KEY,
                    ...params
                };

                const response = await axios.get(ENDPOINTS.NOW_PLAYING_MOVIES, {
                    params: apiParams,
                    headers: {
                        'Accept': 'application/json'
                    }
                });


                if (!response.data || !response.data.results) {
                    throw new Error('Invalid API response structure');
                }

                // 🔄 Process data through Model
                const NowPlayingMovies = createHomepageData(response.data);
                const featured = NowPlayingMovies.getNowPlayingMovies(6);
                const defaultMovie = NowPlayingMovies.getDefaultFeaturedMovie();

                console.log('✅ Fetched now playing movies:', response.data);
                setNowPlayingMovies(NowPlayingMovies);
                setFeaturedMovies(featured);
                setCurrentMovie(defaultMovie);

            } catch (error) {
                console.error('❌ Error fetching now playing movies:', error);
                setError(error.message || 'Failed to fetch movies');
            } finally {
                setLoading(false);
            }
        };

        fetchNowPlayingMovies();
    }, [params]);

    return {
        featuredMovies,
        currentMovie,
        loading,
        error
    };
};

//controller popular movies
export const usePopularMovies = (params) => {
    const [popularMovies, setPopularMovies] = useState([]);
    const [processedMovies, setProcessedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPopularMovies = async () => {
            setLoading(true);
            setError(null);

            try {
                // TMDB API uses api_key as query parameter
                const apiParams = {
                    api_key: API_CONFIG.API_KEY,
                    ...params
                };

                const response = await axios.get(ENDPOINTS.POPULAR_MOVIES, {
                    params: apiParams,
                    headers: {
                        'Accept': 'application/json'
                    }
                });


                if (!response.data || !response.data.results) {
                    throw new Error('Invalid API response structure');
                }

                const homepageData = createHomepageData(response.data);
                const popular = homepageData.getPopularMovies(40);
                console.log('✅ Fetched popular movies:', response.data);
                setPopularMovies(response.data);
                setProcessedMovies(popular);

            } catch (error) {
                console.error('❌ Error fetching popular movies:', error);
                setError(error.message || 'Failed to fetch popular movies');
            } finally {
                setLoading(false);
            }
        };

        fetchPopularMovies();
    }, [params]);

    return {
        popularMovies,
        processedMovies,
        loading,
        error
    };
};

//controller upcoming movie
export const useUpcomingMovies = (params) => {
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [processedMovies, setProcessedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUpcomingMovies = async () => {
            setLoading(true);
            setError(null);

            try {
                // TMDB API uses api_key as query parameter
                const apiParams = {
                    api_key: API_CONFIG.API_KEY,
                    ...params
                };

                const response = await axios.get(ENDPOINTS.UPCOMING_MOVIES, {
                    params: apiParams,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.data || !response.data.results) {
                    throw new Error('Invalid API response structure');
                }

                const homepageData = createHomepageData(response.data);
                const upcoming = homepageData.getUpcomingMovies(40);
                setUpcomingMovies(response.data);
                setProcessedMovies(upcoming);

            } catch (error) {
                console.error('❌ Error fetching upcoming movies:', error);
                setError(error.message || 'Failed to fetch upcoming movies');
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingMovies();
    }, [params]);

    return {
        upcomingMovies,
        processedMovies,
        loading,
        error
    };
};


//controller for each genre movie
// ...existing code...
export const useGenreMovie = (genreId, params = {}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [genreMovies, setGenreMovies] = useState([]);
    const [currentGenreMovies, setCurrentGenreMovies] = useState([]);
    useEffect(() => {

        const fetchGenreMovies = async () => {
            if (!genreId) {
                setGenreMovies([]);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // build discover params, include with_genres
                const apiParams = {
                    api_key: API_CONFIG.API_KEY,
                    with_genres: Array.isArray(genreId) ? genreId.join(',') : String(genreId),
                    page: params.page || 1,
                    language: params.language || 'en-US',
                    include_adult: false,
                    ...params
                };


                const endpoint = ENDPOINTS.DISCOVER_MOVIES;
                console.log('Fetching genre movies from', endpoint, 'params:', apiParams);

                const response = await axios.get(endpoint, {
                    params: apiParams,
                    headers: { Accept: 'application/json' },

                });

                if (!response.data || !Array.isArray(response.data.results)) {
                    throw new Error('Invalid API response');
                }

                const results = response.data.results || [];
                setGenreMovies(results);

            } catch (err) {

                console.error('Failed to fetch genre movies:', err);
                setError(err.message || 'Failed to fetch genre movies');

            } finally {
                setLoading(false);
            }
        };

        fetchGenreMovies();

    }, [genreId, JSON.stringify(params)]); // params in dependency

    return { genreId, genreMovies, currentGenreMovies, loading, error };
};


// Movie genre options
export const useGenreOptions = () => {
    const [options, setOptions] = useState([]);
    useEffect(() => {
        const modelOptions = createHomepageData({ results: [] }).getGenreOptions();
        setOptions(modelOptions);
    }, []);

    return {
        options
    };
};
