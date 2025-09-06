
import React from 'react';
import { Row, Col, Card, Button, Typography, Carousel, Space, Form, Input, Flex, Checkbox } from 'antd'
import { PlayCircleOutlined, StarFilled, UserOutlined } from '@ant-design/icons'

import { usePopularMovies } from "../controllers/HomepageController.js"
const { Meta } = Card;
const { Title, Text } = Typography;

export const MoviePopular = () => {

    const {
        processedMovies,
        loading: popularLoading,
        error: popularError
    } = usePopularMovies();
    return (
        <section className="flex justify-center w-full mx-auto popular-section"
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
                    className="popular-slider !pb-10"
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
                                                            src={`https://image.tmdb.org/t/p/w500${movie.posterUrl}`}
                                                            className="w-full h-64 object-fill"
                                                        />
                                                    }
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
