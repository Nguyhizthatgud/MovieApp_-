
import React from 'react';
import { Row, Col, Card, Button, Typography, Carousel, Space, Form, Input, Flex, Checkbox } from 'antd'
import { PlayCircleOutlined, StarFilled, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom';
import { usePopularMovies } from "../controllers/HomepageController.js"
import "./arrow-slick.css"
const { Meta } = Card;
const { Title, Text } = Typography;

export const MoviePopular = () => {
    const {
        processedMovies,
        loading: popularLoading,
        error: popularError
    } = usePopularMovies();
    const navigate = useNavigate();
    const handleWatchPopular = React.useCallback((movie) => {
        if (!movie || !movie.id) return;
        navigate(`/movie/${movie.id}`, { state: { movie } });
    });
    if (popularLoading) {
        return null;
    }

    return (
        <section className=" flex justify-center w-full mx-auto popular-section"
            style={{ padding: "60px 0 0  0" }}>
            <div className="container">
                <Title level={2} className="!text-white !mb-6">
                    Popular Movies
                </Title>
                <Carousel
                    dots={true}
                    arrows={true}
                    slidesToShow={1}
                    slidesToScroll={1}
                    infinite={true}
                    responsive={[]}
                    effect="fade"
                    className="popular-slider custom-carousel !pb-10"
                >

                    {/* loop card */}
                    {processedMovies && processedMovies.length > 0 &&
                        Array.from({ length: 4 }).map((_, slideIdx) => {
                            let slideMovies;
                            if (slideIdx === 0) {
                                slideMovies = processedMovies.slice(0, 6);
                            } else if (slideIdx === 1) {
                                slideMovies = processedMovies.slice(6, 12);
                            } else if (slideIdx === 2) {
                                slideMovies = processedMovies.slice(12, 18);
                            } else if (slideIdx === 3) {
                                slideMovies = processedMovies.slice(18, 20).concat(processedMovies.slice(0, 4));
                            }
                            return (
                                <div key={slideIdx} className="!px-10">
                                    <Row gutter={[16, 16]}>
                                        {slideMovies.map((movie) => (
                                            <Col xs={24} sm={12} md={8} lg={4} xl={4} key={movie.id}>
                                                <Card
                                                    hoverable
                                                    className="bg-gray-800 border-gray-700"
                                                    cover={
                                                        <img
                                                            alt={movie.title}
                                                            src={movie.posterUrl ? `https://image.tmdb.org/t/p/w500${movie.posterUrl}` : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%23ffffff'%3ENo Image%3C/text%3E%3C/svg%3E"}
                                                            className="w-full h-64 object-fill"
                                                        />
                                                    }
                                                    onClick={() => handleWatchPopular(movie)}
                                                    actions={[
                                                        <Button
                                                            type="text"
                                                            icon={<PlayCircleOutlined />}
                                                            className="text-white hover:!text-red-500"
                                                        >
                                                            Watch
                                                        </Button>
                                                    ]}
                                                >
                                                    <Meta
                                                        title={
                                                            <div className="container mx-auto px-2">
                                                                <Text className="text-white text-sm font-semibold" ellipsis>
                                                                    {movie.title}
                                                                </Text>
                                                            </div>
                                                        }
                                                        description={

                                                            <div className="flex justify-between items-center">
                                                                <Text className="text-gray-400 text-xs">
                                                                    {
                                                                        movie.releaseDate ? (movie.releaseDate) : "Unknown"
                                                                    }
                                                                </Text>
                                                                <div className="flex items-center gap-1">
                                                                    <StarFilled className="!text-yellow-400 text-xs" />
                                                                    <Text className="text-gray-300 text-xs">
                                                                        {movie.rating ? movie.rating : "N/A"}
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            );
                        })
                    }
                </Carousel>
            </div>
        </section>
    );
};
