import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, Card, Button, Typography, Carousel, Space, Form, Input, Flex, Checkbox } from 'antd'
import { PlayCircleOutlined, StarFilled, UserOutlined } from '@ant-design/icons'
import { useNowPlaying } from '../controllers/HomepageController.js'
import { useForm, Controller } from "react-hook-form";
import { Link, Navigate } from 'react-router-dom'
const { Title, Text } = Typography;
const { Meta } = Card;


export const MovieHero = () => {
    const {
        featuredMovies,
        currentMovie,
        loading: nowPlayingLoading,
        error: nowPlayingError
    } = useNowPlaying();

    const { control, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("Form submitted:", data);
    };
    const handleOnPlayClick = () => {
        if (currentMovie) {
            return <Navigate to={`/detail/${currentMovie.id}`} state={{ movie: currentMovie }} />
        }
    };

    return (
        <section className="Carousel">
            <Carousel
                autoplay
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
                    <div className="grid grid-cols-2 grid-rows-2 gap-10 !py-20">
                        <div className="hero-title col-span-1 row-start-1">
                            <Title className="!text-white text-4xl">
                                Hi There.
                            </Title>
                            <Title level={4} className="!text-white text-3xl !mb-40 ">
                                Millions of movies, TV shows and people to discover. Explore now.
                            </Title>
                        </div>

                        <div className="movie-title col-span-1 row-start-2">
                            {currentMovie && (
                                <div className="">
                                    <div className="">
                                        <Title keyboard={true} ellipsis level={2} className="!text-white !mb-10">
                                            {currentMovie.title}
                                        </Title>

                                        <Text className="!text-gray-200 !text-lg !mb-4 !block">
                                            {currentMovie.overview?.substring(0, 200)}...
                                        </Text>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<PlayCircleOutlined />}
                                            onClick={handleOnPlayClick}
                                        >
                                            Watch Now
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            <StarFilled className="!text-yellow-400" />
                                            <Text className="!text-white">{currentMovie.vote_average?.toFixed(1)}</Text>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-transparent border border-gray-300 rounded-xl w-109 col-span-1 col-start-2 row-start-1 flex items-center justify-end"
                            style={{ zIndex: 10, backdropFilter: "blur(10px) grayscale(50%)" }}>

                            <Form
                                size="large"
                                className=""
                                onFinish={handleSubmit(onSubmit)}
                                initialValues={{ remember: true }}
                            >
                                <Controller
                                    name="username"
                                    control={control}
                                    rules={{
                                        required: "Nhập tên đeee anh ơi!",
                                        minLength: { value: 3, message: "Tên phải có ít nhất 3 ký tự!" }
                                    }}
                                    render={({ field }) => {
                                        return (
                                            <Form.Item
                                                name="username"
                                                validateStatus={errors.username ? "error" : ""}
                                                help={errors.username ? errors.username.message : ""}
                                            >
                                                <Input {...field} prefix={<UserOutlined />} placeholder="Nhập tên nè anh ơi." className="rounded-lg" />
                                            </Form.Item>
                                        );
                                    }}
                                />

                                <Form.Item>
                                    <Flex justify="space-between" align="center">
                                        <Controller
                                            name="remember"
                                            control={control}
                                            defaultValue={false}
                                            render={({ field }) => (
                                                <Checkbox {...field} checked={field.value} onChange={(e) => field.onChange(e.target.checked)}>
                                                    Remember me
                                                </Checkbox>
                                            )}
                                        />
                                        <a href="#forgot">Forgot password</a>
                                    </Flex>
                                </Form.Item>

                                <Form.Item>
                                    <Button block type="primary" htmlType="submit">
                                        Vào đi anh!
                                    </Button>
                                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                                        or <a href="#register">Register now!</a>
                                    </div>
                                </Form.Item>
                            </Form>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}


