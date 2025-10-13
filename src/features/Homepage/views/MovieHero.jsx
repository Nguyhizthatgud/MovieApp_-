import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, Card, Button, Typography, Carousel, Space, Form, Input, Flex, Checkbox, Rate, Spin, Skeleton } from 'antd'
import { PlayCircleOutlined, StarFilled, UserOutlined, StarOutlined } from '@ant-design/icons'
import { useNowPlaying } from '../controllers/HomepageController.js'
import LoginForm from './LoginForm.jsx'
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../../app/hooks/useAuth.jsx';
const { Title, Text } = Typography;
const { Meta } = Card;


export const MovieHero = () => {
    const {
        featuredMovies,
        loading: nowPlayingLoading,
        error: nowPlayingError
    } = useNowPlaying();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors } } = useForm();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const onTrackMovieChange = useMemo(() => {
        return featuredMovies?.[currentSlideIndex] || featuredMovies?.[0] || null;
    }, [featuredMovies, currentSlideIndex]);


    const handleOnPlayClick = () => {
        // navigate(`/Movie/${currentMovie.id}`, { state: { movie: currentMovie } });
        if (onTrackMovieChange?.id) {
            navigate(`/Movie/${onTrackMovieChange.id}`, { state: { movie: onTrackMovieChange } });
        }
    };
    if (nowPlayingLoading) {
        return (
            null
        )
    }
    return (

        <section className="Carousel">
            <Carousel
                autoplay
                beforeChange={(current, next) => setCurrentSlideIndex(next)}
            >
                {featuredMovies?.map((movie) => (
                    <div key={movie.id}>
                        <div
                            className="h-190 bg-cover relative"
                            style={{
                                backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(https://image.tmdb.org/t/p/w1280${movie.backdropUrl})`,
                            }}
                        >
                        </div>
                    </div>
                ))}
            </Carousel>
            <div className="absolute top-0 left-0 w-full flex justify-center px-20">
                <div className="container">
                    <div className={`${user ? 'grid grid-cols-1 gap-10' : 'grid grid-cols-3 gap-10'} !py-20`}>
                        <div className="hero-title col-span-2 row-start-1">
                            <Title className="!text-white text-4xl">
                                Hi There.
                            </Title>
                            <Title level={4} className="!text-white text-3xl !mb-40 ">
                                Millions of movies, TV shows and people to discover. Explore now.
                            </Title>
                        </div>

                        <div className="movie-title col-span-2 row-start-2">
                            {onTrackMovieChange && (<div >
                                <div className="">
                                    <Title keyboard={true} ellipsis level={2} className="!text-white !mb-10">
                                        {onTrackMovieChange.title}
                                    </Title>

                                    <Text className="!text-gray-200 !text-lg !mb-4 !block">
                                        {onTrackMovieChange.overview?.substring(0, 200)}
                                    </Text>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlayCircleOutlined />}
                                        onClick={() => handleOnPlayClick()}
                                    >
                                        Watch Now
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <StarOutlined className="text-yellow-400" />
                                        <Rate
                                            disabled
                                            value={onTrackMovieChange.rating ? onTrackMovieChange.rating / 2 : 0}
                                            allowHalf
                                            className="text-yellow-400"
                                        />
                                        <Text className="!text-white ml-2">
                                            {onTrackMovieChange.rating ? onTrackMovieChange.rating : 'N/A'}/10
                                        </Text>
                                    </div>
                                </div>
                            </div>
                            )}

                        </div>
                        {/* loginform */}
                        {!user && (
                            <div className="flex items-center justify-center col-span-2 row-start-1 row-end-3">
                                <div className="max-w-md">
                                    <LoginForm />
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </section>
    )
}

