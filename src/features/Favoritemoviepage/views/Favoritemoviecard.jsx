// Create: src/features/Favorites/components/FavoriteMovieCard.jsx
import React from 'react';
import { Card, Button, Rate, Tag, Tooltip, Image } from 'antd';
import { HeartFilled, CalendarOutlined, StarOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

const FavoriteMovieCard = ({ movie, onRemove, loading }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/movie/${movie.id}`);
    };

    const handleRemove = () => {
        onRemove(movie.id);
    };

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/placeholder-poster.jpg';

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : 0;

    return (
        <Card
            hoverable
            className="favorite-movie-card h-full"
            cover={
                <div className="relative overflow-hidden h-64">
                    <Image
                        alt={movie.title}
                        src={posterUrl}
                        className="w-full h-full object-cover"
                        preview={false}
                        fallback="/placeholder-poster.jpg"
                    />
                    <div className="absolute top-2 right-2">
                        <Tag color="red" icon={<HeartFilled />}>
                            Favorite
                        </Tag>
                    </div>
                </div>
            }
            actions={[
                <Tooltip title="View Details" key="view">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={handleViewDetails}
                    >
                        View
                    </Button>
                </Tooltip>,
                <Tooltip title="Remove from Favorites" key="remove">
                    <Button
                        type="text"
                        danger
                        icon={<HeartFilled />}
                        onClick={handleRemove}
                        loading={loading}
                    >
                        Remove
                    </Button>
                </Tooltip>
            ]}
        >
            <Meta
                title={
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold line-clamp-2">
                            {movie.title}
                        </span>
                    </div>
                }
                description={
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarOutlined />
                            <span>{releaseYear}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <StarOutlined className="text-yellow-500" />
                            <Rate
                                disabled
                                allowHalf
                                value={parseFloat(rating)}
                                style={{ fontSize: '12px' }}
                            />
                            <span className="text-xs text-gray-500">
                                ({movie.vote_average?.toFixed(1)})
                            </span>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-3 mt-2">
                            {movie.overview || 'No description available.'}
                        </p>

                        {movie.genre_ids && movie.genre_ids.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {movie.genre_ids.slice(0, 2).map(genreId => (
                                    <Tag key={genreId} size="small" color="blue">
                                        Genre {genreId}
                                    </Tag>
                                ))}
                            </div>
                        )}
                    </div>
                }
            />
        </Card>
    );
};

export default FavoriteMovieCard;