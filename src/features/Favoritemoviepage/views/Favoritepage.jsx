import React from 'react';
import {
    Row,
    Col,
    Typography,
    Spin,
    Empty,
    Alert,
    Pagination,
    Button,
    Statistic,
    Card,
    notification
} from 'antd';
import { HeartOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useFavoriteMovies } from '../controllers/FavoritesController.jsx';
import FavoriteMovieCard from './Favoritemoviecard.jsx';
const { Title, Text } = Typography;

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();

    const {
        favoriteMovies,
        loading,
        error,
        pagination,
        getFavoriteMovies,
        removeFromFavorites,
        refreshFavorites
    } = useFavoriteMovies();

    const handleRemoveFromFavorites = async (movieId) => {
        try {
            await removeFromFavorites(movieId);

            api.success({
                message: 'Removed from Favorites',
                description: 'Movie has been removed from your favorites list.',
                placement: 'topRight'
            });
        } catch (error) {
            api.error({
                message: 'Error',
                description: 'Failed to remove movie from favorites. Please try again.',
                placement: 'topRight'
            });
        }
    };

    const handlePageChange = (page) => {
        getFavoriteMovies(page);
    };

    const handleRefresh = () => {
        refreshFavorites();
    };

    const handleGoHome = () => {
        navigate('/');
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6">
                {contextHolder}
                <div className="container mx-auto">
                    <Alert
                        message="Error Loading Favorites"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" danger onClick={handleRefresh}>
                                Try Again
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen !pt-24 relative"
            style={{ background: 'no-repeat center/cover url("../../../../bg2.svg")' }}>
            {contextHolder}
            <div className="absolute inset-0 bg-black/50 z-0"></div>
            {/* Header Section */}
            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <Title level={1} className="!text-white !mb-2">
                                <HeartOutlined className="!mr-3" />
                                Favorite Movies
                            </Title>
                            <Text className="!text-red-100 text-lg">
                                Your personal collection of amazing movies
                            </Text>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                icon={<HomeOutlined />}
                                onClick={handleGoHome}
                                size="large"
                            >
                                Back to Home
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={loading}
                                size="large"
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Stats Section */}
                <div className="container !py-8">


                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-12">
                            <Spin size="large" tip="Loading your favorite movies..." />
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && favoriteMovies.length === 0 && (
                        <div className="flex justify-center py-12">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span className="text-gray-400">
                                        No favorite movies yet. Start adding some!
                                    </span>
                                }
                            >
                                <Button type="primary" onClick={handleGoHome}>
                                    Browse Movies
                                </Button>
                            </Empty>
                        </div>
                    )}

                    {/* Movies Grid */}
                    {!loading && favoriteMovies.length > 0 && (
                        <>
                            <Row gutter={[16, 16]}>
                                {favoriteMovies.map(movie => (
                                    <Col
                                        key={movie.id}
                                        xs={24}
                                        sm={12}
                                        md={8}
                                        lg={6}
                                        xl={4}
                                    >
                                        <FavoriteMovieCard
                                            movie={movie}
                                            onRemove={handleRemoveFromFavorites}
                                            loading={loading}
                                        />
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center mt-8">
                                    <Pagination
                                        current={pagination.page}
                                        total={pagination.totalResults}
                                        pageSize={20}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                        showQuickJumper
                                        showTotal={(total, range) =>
                                            `${range[0]}-${range[1]} of ${total} movies`
                                        }
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

        </div >
    );
};

export default FavoritesPage;