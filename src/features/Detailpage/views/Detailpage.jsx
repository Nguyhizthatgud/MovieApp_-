import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Typography, Spin } from 'antd'
import { API_CONFIG, ENDPOINTS } from '../../../shared/api/config.js'
import axios from 'axios'

const { Title, Text } = Typography
const { Meta } = Card

const Detailpage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()
    const movieFromState = location.state && location.state.movie
    const [movie, setMovie] = useState(movieFromState || null)
    const [loading, setLoading] = useState(!movieFromState)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (movieFromState) return
        const id = params.id
        if (!id) {
            setError('No movie id provided')
            setLoading(false)
            return
        }

        const fetchDetails = async () => {
            setLoading(true)
            try {
                const res = await axios.get(ENDPOINTS.MOVIE_DETAILS(id), {
                    params: { api_key: API_CONFIG.API_KEY }
                })
                setMovie(res.data)
            } catch (err) {
                setError(err.message || 'Failed to fetch movie details')
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [movieFromState, params.id])

    if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>
    if (error) return <div className="text-center py-20 text-red-400">{error}</div>

    return (
        <div className="container py-10">
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1">
                    <img
                        alt={movie.title}
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path || movie.posterUrl}`}
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>

                <div className="col-span-2">
                    <Title level={2}>{movie.title}</Title>
                    <div className="flex items-center gap-4 mb-4">
                        <Text className="text-gray-300">Release: {movie.release_date || movie.releaseDate}</Text>
                        <Text className="text-yellow-400">Rating: {movie.vote_average || movie.rating}</Text>
                    </div>

                    <div className="prose max-w-none text-gray-200">
                        <Text>{movie.overview}</Text>
                    </div>

                    <div className="mt-6">
                        <Button onClick={() => navigate(-1)} type="default">
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Detailpage
