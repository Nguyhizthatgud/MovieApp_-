import React from 'react';
import { FormTextField, FormSwitch, FormSelect, FormRadioGroup } from "form4antdesign";
import { createHomepageData } from '../models/HomepageModel';
import { useForm, FormProvider } from 'react-hook-form';
import { useGenreOptions } from '../controllers/HomepageController';
import { useGenreMovie } from '../controllers/HomepageController';
import { Row, Col, Card, Typography, Form, Button, Carousel } from 'antd';
import { PlayCircleOutlined, StarFilled, UserOutlined } from '@ant-design/icons'
const { Meta } = Card;
const { Title, Text } = Typography;
export const MovieGenre = () => {
    const { options } = useGenreOptions();
    const methods = useForm();
    const { control } = methods;
    const genreChoices = methods.watch("genre");
    const genreId = genreChoices ? genreChoices : null;

    const { genreMovies, loading, error, currentGenreMovies } = useGenreMovie(genreId);
    React.useEffect(() => {
        return () => {
            console.log('genreId changed:', genreId);
        }
    }, [genreId])

    return (
        <FormProvider {...methods}>
            <section className="container px-8 pb-8">
                <Title level={2} className="text-white mb-6">
                    Browse by Movie Genres
                </Title>

                <div className="mb-6 w-64">
                    <FormSelect
                        name="genre"
                        label="Select Genre"
                        options={options}
                        value={methods.getValues("genre")}
                        onChange={(value) => {
                            methods.setValue("genre", value);
                        }}
                        placeholder="Select film genre"
                        control={control}

                    />
                </div>
                <Carousel dots={true}
                    arrows={true}
                    slidesToShow={1}
                    slidesToScroll={1}
                    infinite={true}
                    responsive={[]}
                    effect="fade"
                    className="!pb-10">
                    {genreMovies && genreMovies.length > 0 && Array.from({ length: 4 }).map((_, slideIdx) => {
                        let slideMovies;
                        if (slideIdx === 0) {
                            slideMovies = genreMovies.slice(0, 6);
                        } else if (slideIdx === 1) {
                            slideMovies = genreMovies.slice(6, 12);
                        } else if (slideIdx === 2) {
                            slideMovies = genreMovies.slice(12, 18);
                        } else if (slideIdx === 3) {
                            slideMovies = genreMovies.slice(18, 20).concat(genreMovies.slice(0, 4));
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
                                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
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
                    })}
                </Carousel>
            </section>
        </FormProvider>
    );
};