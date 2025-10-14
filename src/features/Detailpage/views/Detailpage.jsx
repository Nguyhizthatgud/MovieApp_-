import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Typography, Spin, Row, Col, Space, Alert, Tag, Rate, Divider, Skeleton, Modal, Tooltip, notification } from 'antd'
import { PlayCircleOutlined, ArrowLeftOutlined, CalendarOutlined, StarOutlined, ClockCircleOutlined, HeartOutlined, HeartFilled, CloseOutlined } from '@ant-design/icons'
import { API_CONFIG, ENDPOINTS } from '../../../shared/api/config.js'

import { useDetailPage, useFavorite } from '../controllers/DetailpageController.js'
import useAuth from '../../../app/hooks/useAuth.jsx'
import "./Detailpage.css"
const { Title, Text, Paragraph } = Typography

const Detailpage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate(); // ensure navigate exists for error UI
    const { movie, loading, video, error, cast } = useDetailPage(id);
    const { isFavorite, addFavorite, removeFavorite, getFavoriteMovies, handleFavoriteToggle, favoriteMovies, loading: favoriteLoading, error: favoriteError } = useFavorite(id);
    const [isTrailerModalVisible, setIsTrailerModalVisible] = useState(false);
    const [selectedTrailer, setSelectedTrailer] = useState(null);
    const [videoSrc, setVideoSrc] = useState('');

    // set loading & scroll up on mount 
    const [imageLoading, setImageLoading] = useState(true);

    const [api, contextHolder] = notification.useNotification();
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const movieId = useMemo(() => {
        return id ?? (movie?.id || movie?.movie_id) ?? null
    }, [id, movie])

    const genres = useMemo(() => {
        if (!movie) return []
        return movie.getGenresNames ? movie.getGenresNames() :
            Array.isArray(movie.genres) ? movie.genres.map(g => g.name || g) : []
    }, [movie])

    const posterUrl = useMemo(() => {
        if (!movie) return null
        if (typeof movie.getPosterPath === 'function') {
            const p = movie.getPosterPath('w500')
            if (p) return p.startsWith('http') ? p : `${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/w500${p}`
        }
        const p = movie.poster_path ?? movie.posterPath ?? movie.posterUrl ?? movie.raw?.poster_path ?? movie.raw?.posterPath
        if (!p) return null
        return p.startsWith('http') ? p : `${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/w500${p}`
    }, [movie])
    const backdropUrl = useMemo(() => {
        if (!movie) return null
        if (typeof movie.getBackdropPath === 'function') {
            const b = movie.getBackdropPath('original')
            if (b) return b.startsWith('http') ? b : `${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/original${b}`
        }
        const b = movie.backdrop_path ?? movie.backdropPath ?? movie.backdropUrl ?? movie.raw?.backdrop_path ?? movie.raw?.backdropPath
        if (!b) return null
        return b.startsWith('http') ? b : `${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/original${b}`
    }, [movie])

    const collection = useMemo(() => {
        if (!movie) return null
        // support both normalized model and raw API object
        const c = movie.belongs_to_collection ?? movie.raw?.belongs_to_collection ?? movie.collection ?? null
        if (!c) return null
        return {
            id: c.id,
            name: c.name,
            poster_path: c.poster_path ?? c.posterPath ?? c.poster,
            backdrop_path: c.backdrop_path ?? c.backdropPath ?? c.backdrop
        }
    }, [movie])
    const handlePlayTrailer = () => {
        const trailer = video?.find(v => v.site === 'YouTube' && v.type === 'Trailer');

        if (trailer) {
            setSelectedTrailer(trailer);
            setVideoSrc(`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`);
            setIsTrailerModalVisible(true);
        } else {
            Modal.info({
                title: 'No Trailer Available',
                content: 'Sorry, no trailer is available for this movie.',
                okText: 'OK'
            });
        }
    };
    const handleFavoriteClick = async () => {
        try {
            await handleFavoriteToggle();
            api.success({
                message: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
                description: (<div> Movie <span className="font-semibold">{movie.title}</span> has been {isFavorite ? 'removed from' : 'added to'} your favorites.</div>),
                placement: 'topRight'
            });
        } catch (error) {
            api.error({
                message: 'Error',
                description: 'Failed to update favorites. Please try again.',
                placement: 'topRight'
            });
        }
    };

    const closeTrailerModal = () => {
        setVideoSrc('');
        setIsTrailerModalVisible(false);
        setTimeout(() => {
            setSelectedTrailer(null);
        }, 100);
    };
    useEffect(() => {
        if (posterUrl) {
            setImageLoading(true);
        }
    }, [posterUrl]);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <Alert
                        message={error ? "Error Loading Movie" : "Movie Not Found"}
                        description={error || "The requested movie could not be found."}
                        type="error"
                        showIcon
                        className="!mb-6"
                    />
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        size="large"
                        block
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }


    return (
        <section className="min-h-screen w-full text-white px-4 py-8">
            {/* Hero Section with Backdrop */}
            {contextHolder}
            <div className="relative flex w-full justify-center bg-gray-500">
                {backdropUrl && (
                    <div
                        className="absolute inset-0 bg-cover opacity-30 bg-no-repeat"
                        style={{ backgroundImage: `url(${backdropUrl})` }}
                    >
                        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
                    </div>
                )}

                <div className="relative z-10 container mx-auto !px-6 !py-20">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        className="!mb-8 "
                        size="large"
                    >
                        Back
                    </Button>

                    <Row gutter={[32, 32]} align="middle">
                        <Col xs={24} md={8} lg={6}>
                            <div className="flex justify-center">
                                {posterUrl ? (
                                    <div className="relative w-full max-w-sm">
                                        {/* Show spinner while image is loading */}
                                        {imageLoading && (
                                            <div className="absolute inset-0 bg-gray-700 rounded-xl flex items-center justify-center z-10">
                                                <Spin size="large" />
                                            </div>
                                        )}

                                        <img
                                            src={posterUrl}
                                            alt={movie.title}
                                            className={`w-full rounded-xl shadow-2xl transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
                                                }`}
                                            onLoad={handleImageLoad}
                                            onError={handleImageError}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full max-w-sm h-96 bg-gray-700 rounded-xl flex items-center justify-center">
                                        <Text className="text-gray-400">No poster available</Text>
                                    </div>
                                )}
                            </div>
                        </Col>

                        <Col xs={24} md={16} lg={18}>
                            <Space direction="vertical" size="large" className="w-full">
                                <div>
                                    <Title level={1} className="!text-white mb-2 !text-4xl md:!text-5xl">
                                        {movie.title}
                                    </Title>
                                    {movie.tagline && (
                                        <Text className="!text-gray-300 text-lg italic">"{movie.tagline}"</Text>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <StarOutlined className="text-yellow-400" />
                                        <Rate
                                            disabled
                                            value={movie.vote_average ? movie.vote_average / 2 : 0}
                                            allowHalf
                                            className="!text-yellow-400"
                                        />
                                        <Text className="!text-white ml-2">
                                            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10
                                        </Text>
                                    </div>

                                    {movie.release_date
                                        && (
                                            <div className="flex items-center gap-2">
                                                <CalendarOutlined className="text-blue-400" />
                                                <Text className="!text-gray-300">
                                                    {new Date(movie.release_date).getFullYear()}
                                                </Text>
                                            </div>
                                        )}

                                    {movie.runtime && (
                                        <div className="flex items-center gap-2">
                                            <ClockCircleOutlined className="!text-green-400" />
                                            <Text className="!text-gray-300">
                                                {movie.runtimeFormatted ? movie.runtimeFormatted() : `${movie.runtime} min`}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    {genres.length > 0 && (
                                        <div>
                                            <Text className="!text-gray-300 !mr-3">Genres:</Text>
                                            <Space wrap>
                                                {genres.map((genre, index) => (
                                                    <Tag key={index} color="blue" className="!text-sm">
                                                        {genre}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </div>
                                    )}
                                    <div>
                                        {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                                            <div className="!mt-2">
                                                <Text className="!text-gray-300 !mr-3">Languages:</Text>
                                                <Space wrap>
                                                    {movie.spoken_languages.map((lang, index) => (
                                                        <Tag key={index} color="blue" className="text-sm">
                                                            {lang.name}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlayCircleOutlined />}
                                    className="bg-red-600 hover:bg-red-700 border-red-600 text-white font-semibold px-8 py-6 h-auto"
                                    onClick={handlePlayTrailer}
                                >
                                    Watch Trailer
                                </Button>
                                <div className="flex gap-4 mt-6">
                                    {/* Favorite Button */}
                                    <Button
                                        size="large"
                                        onClick={handleFavoriteClick}
                                        icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                                        loading={favoriteLoading}
                                        className={`font-semibold px-8 py-6 h-auto ${isFavorite
                                            ? '!bg-pink-600 hover:bg-pink-700 !border-pink-600 !text-white'
                                            : '!bg-gray-700 hover:bg-gray-600 !order-gray-600 !text-white'
                                            }`}

                                        disabled={!user}
                                    >
                                        {user ? <Tooltip title="Add to favorites">

                                        </Tooltip> : 'Login to favorite'}
                                        {isFavorite ? 'Favorited' : 'Add to Favorites'}
                                    </Button>
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </div>




            {/* Content Section */}

            <div className="flex justify-center !my-12">
                <div className="container mx-auto !px-6 w-full">
                    <Row gutter={[32, 32]}>
                        {/* Main Content Column */}
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size="large" className="w-full">
                                {/* Overview Card */}
                                <Card
                                    className="bg-gray-800 border-gray-700 shadow-xl"
                                    bordered={false}
                                >
                                    <Title level={3} className="text-white mb-6 flex items-center gap-3">
                                        <div className="w-1 h-8 bg-red-600 rounded"></div>
                                        Overview
                                    </Title>
                                    <Paragraph className="text-gray-300 text-lg leading-relaxed mb-0">
                                        {movie.overview || 'No overview available for this movie.'}
                                    </Paragraph>
                                </Card>
                                {/* Cast & Crew Card */}
                                <Card
                                    className="bg-gray-800 border-gray-700 shadow-xl"
                                >
                                    <Title level={4} className="text-white mb-4 flex items-center gap-3">
                                        <div className="w-1 h-6 bg-green-500 rounded"></div>
                                        Cast & Crew
                                    </Title>
                                    <div className="flex flex-wrap gap-4">
                                        {cast && cast.map((member) => (
                                            <div key={member.id} className="flex items-center gap-2">
                                                <img
                                                    src={member.profile_path ? `${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/w92${member.profile_path}` : 'https://via.placeholder.com/48x48?text=No+Image'}
                                                    alt={member.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <Text className="text-white font-semibold">{member.name}</Text>
                                                    <br />
                                                    <Text className="text-gray-400 text-sm">{member.character}</Text>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                                {/* Collection Card */}
                                {collection && (
                                    <Card
                                        className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 shadow-xl"
                                    >
                                        <Title level={4} className="text-white mb-4 flex items-center gap-3">
                                            <div className="w-1 h-6 bg-blue-500 rounded"></div>
                                            Part of Collection
                                        </Title>
                                        <div className="flex items-center gap-4">
                                            {collection.poster_path && (
                                                <img
                                                    src={`${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/w92${collection.poster_path}`}
                                                    alt={collection.name}
                                                    className="w-16 h-24 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <Text className="text-white text-lg font-semibold">
                                                    {collection.name}
                                                </Text>
                                                <br />
                                                <Text className="text-gray-400">
                                                    Explore more movies in this collection
                                                </Text>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </Space>
                        </Col>

                        {/* Sidebar Column */}
                        <Col xs={24} lg={8}>
                            <Space direction="vertical" size="large" className="w-full">
                                {/* Movie Details Card */}
                                <Card
                                    className="bg-gray-800 border-gray-700 shadow-xl"
                                >
                                    <Title level={4} className="text-white mb-6 flex items-center gap-3">
                                        <div className="w-1 h-6 bg-yellow-500 rounded"></div>
                                        Movie Details
                                    </Title>
                                    <Space direction="vertical" size="middle" className="w-full">
                                        {movie.release_date && (
                                            <div className="border-b border-gray-700 pb-3">
                                                <Text className="text-gray-400 text-sm uppercase tracking-wide">Release Date</Text>
                                                <br />
                                                <Text className="text-white text-lg font-medium">
                                                    {new Date(movie.release_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </Text>
                                            </div>
                                        )}

                                        {movie.status && (
                                            <div className="border-b border-gray-700 !pb-1">
                                                <Text className="text-gray-400 text-sm uppercase tracking-wide">Status</Text>
                                                <br />
                                                <Tag color={movie.status === 'Released' ? 'green' : 'orange'} className="text-sm">
                                                    {movie.status}
                                                </Tag>
                                            </div>
                                        )}

                                        {movie.budget ? movie.budget && movie.budget > 0 && (
                                            <div className="border-b border-gray-700 pb-3">
                                                <Text className="text-gray-400 text-sm uppercase tracking-wide">Budget</Text>
                                                <br />
                                                <Text className="text-white text-lg font-medium">
                                                    ${movie.budget.toLocaleString()}
                                                </Text>
                                            </div>
                                        ) : null}

                                        {movie.revenue ? movie.revenue && movie.revenue > 0 && (
                                            <div className="border-b border-gray-700 pb-3">
                                                <Text className="text-gray-400 text-sm uppercase tracking-wide">Revenue</Text>
                                                <br />
                                                <Text className="text-white text-lg font-medium">
                                                    ${movie.revenue.toLocaleString()}
                                                </Text>
                                            </div>
                                        ) : null}

                                        {movie.original_language && (
                                            <div className="border-b border-gray-700 pb-3">
                                                <Text className="text-gray-400 text-sm uppercase tracking-wide">Original Language</Text>
                                                <br />
                                                <Text className="text-white text-lg font-medium uppercase">
                                                    {movie.original_language}
                                                </Text>
                                            </div>
                                        )}

                                        {movie.homepage && (
                                            <div>
                                                <Text className="text-gray-400 text-sm uppercase tracking-wide">Official Website</Text>
                                                <br />
                                                <Button
                                                    type="link"
                                                    href={movie.homepage}
                                                    target="_blank"
                                                    className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                                                >
                                                    Visit Website →
                                                </Button>
                                            </div>
                                        )}
                                    </Space>
                                </Card>

                                {/* Rating Stats Card */}
                                <Card
                                    className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700 shadow-xl"
                                >
                                    <Title level={4} className="text-white mb-4 flex items-center gap-3">
                                        <StarOutlined className="!text-yellow-400" />
                                        Rating Statistics
                                    </Title>
                                    <Space direction="vertical" size="middle" className="w-full">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-yellow-400 mb-2">
                                                {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                            </div>
                                            <Rate
                                                disabled
                                                value={movie.vote_average ? movie.vote_average / 2 : 0}
                                                allowHalf
                                                className="text-yellow-400 mb-2"
                                            />
                                            <Text className="text-gray-300 block">
                                                {movie.vote_count ? `${movie.vote_count.toLocaleString()} votes` : 'No votes yet'}
                                            </Text>
                                        </div>

                                        {movie.popularity && (
                                            <div className="border-t border-yellow-700 pt-3">
                                                <Text className="text-gray-300 text-sm">Popularity Score</Text>
                                                <div className="text-2xl font-semibold">
                                                    {movie.popularity ? Math.round(movie.popularity) : 'N/A'}
                                                </div>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                                {/* Production Info */}
                                {(movie.production_companies || movie.production_countries) && (
                                    <Card
                                        className="bg-gray-800 border-gray-700 shadow-xl"
                                        bordered={false}
                                    >
                                        <Title level={4} className="text-white mb-4 flex items-center gap-3">
                                            <div className="w-1 h-6 bg-green-500 rounded"></div>
                                            Production
                                        </Title>
                                        <Row gutter={[16, 16]}>
                                            {movie.production_companies && movie.production_companies.length > 0 && (
                                                <Col xs={24} sm={12}>
                                                    <Text className="text-gray-400 block mb-2">Production Companies:</Text>
                                                    <Space wrap>
                                                        {movie.production_companies.slice(0, 3).map((company, index) => (
                                                            <Tag key={index} className="bg-gray-700 border-gray-600 text-gray-300">
                                                                {company.name || company}
                                                            </Tag>
                                                        ))}
                                                    </Space>
                                                </Col>
                                            )}

                                            {movie.production_countries
                                                && movie.production_countries
                                                    .length > 0 && (
                                                    <Col xs={24} sm={12}>
                                                        <Text className="text-gray-400 block mb-2">Production Countries:</Text>
                                                        <Space wrap>
                                                            {movie.production_countries.map((country, index) => (
                                                                <Tag key={index} className="bg-blue-900 border-blue-700 text-blue-300">
                                                                    {country.name || country}
                                                                </Tag>
                                                            ))}
                                                        </Space>
                                                    </Col>
                                                )}
                                        </Row>
                                    </Card>
                                )}
                                {/* Production Companies Section */}
                                {(movie.production_companies || movie.productionCompanies) && (
                                    <Card
                                        className="bg-gray-800 border-gray-700 shadow-xl"

                                    >
                                        <Title level={4} className="text-white mb-6 flex items-center !gap-3">
                                            <div className="w-1 h-6 bg-purple-500 rounded"></div>
                                            Production Companies
                                        </Title>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {(movie.production_companies || movie.productionCompanies || []).slice(0, 6).map((company, index) => (
                                                <div key={index} className="flex items-center gap-4 !m  -4 bg-gray-700 rounded-lg border border-gray-600 hover:border-purple-400 transition-colors">
                                                    {/* Company Logo */}
                                                    <div className="flex-shrink-0">
                                                        {company.logo_path ? (
                                                            <img
                                                                src={`${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/w92${company.logo_path}`}
                                                                alt={company.name || company}
                                                                className="w-12 h-12 object-contain bg-white rounded-lg !p-1"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div
                                                            className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center ${company.logo_path ? 'hidden' : 'flex'}`}
                                                        >
                                                            <Text className="text-white font-bold text-lg">
                                                                {(company.name || company).charAt(0)}
                                                            </Text>
                                                        </div>
                                                    </div>

                                                    {/* Company Info */}
                                                    <div className="flex-1 min-w-0 ">
                                                        <Text className="!text-white font-semibold text-lg block truncate">
                                                            {company.name || company}
                                                        </Text>
                                                        {company.origin_country && (
                                                            <Text className="!text-gray-400 text-sm">
                                                                {company.origin_country}
                                                            </Text>
                                                        )}
                                                        {company.headquarters && (
                                                            <Text className="!text-gray-500 text-xs">
                                                                {company.headquarters}
                                                            </Text>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Show more button if there are more companies */}
                                        {(movie.production_companies || movie.productionCompanies || []).length > 6 && (
                                            <div className="!mt-4 text-center">
                                                <Button
                                                    type="link"
                                                    className="!text-purple-400 hover:text-purple-300"
                                                >
                                                    +{(movie.production_companies || movie.productionCompanies || []).length - 6} more companies
                                                </Button>
                                            </div>
                                        )}
                                    </Card>
                                )}
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Trailer Modal */}
                <Modal
                    title={null}
                    open={isTrailerModalVisible}
                    onCancel={closeTrailerModal}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: '1200px' }}
                    centered
                    closable={false}
                    className="trailer-modal"
                >
                    {selectedTrailer && (
                        <div className="bg-black rounded-lg overflow-hidden">
                            {/* Trailer Header */}
                            <div className="bg-dark px-4 py-3 flex items-center justify-between">
                                <div>
                                    <Title level={3} className="!text-white !m-3">
                                        {movie.title}
                                    </Title>
                                    <Text className="!text-white !m-3">
                                        {selectedTrailer.name || 'Official Trailer'}
                                    </Text>
                                </div>
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={closeTrailerModal}
                                    className="!text-white !m-3u  hover:text-gray-300"
                                    size="large"
                                />
                            </div>

                            {/* YouTube Video Embed */}
                            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={videoSrc}
                                    title={selectedTrailer.name || 'Movie Trailer'}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            </div>






        </section>
    )
}

export default Detailpage