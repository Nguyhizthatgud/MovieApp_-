import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { API_CONFIG, ENDPOINTS } from '../../../shared/api/config.js'
export const useDetailPage = (params) => {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()
    const movieFromState = location.state && location.state.movie
    const [movie, setMovie] = useState(movieFromState || null)
    const [loading, setLoading] = useState(!movieFromState)
    const [error, setError] = useState(null)


    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            if (movieFromState) return;


            try {
                const response = await axios.get(
                    ENDPOINTS.MOVIE_DETAILS(params.id),
                    {
                        headers: {
                            'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`
                        }
                    }
                )
                setMovie(response.data);
            } catch (error) {
                setError(error.message || 'Failed to fetch movie details');
                setLoading(false);
            }
        }
        fetchDetails();
    }, [movieFromState, params.id]);
    return {
        movie,
        loading,
        error
    }
};

