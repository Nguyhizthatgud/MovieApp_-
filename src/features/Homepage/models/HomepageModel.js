import { Movie } from './Movie.js';
//  BUSSINESS LOGIC: homepage data model and processing
const processMovies = (rawData) => {
    const results = rawData.results || [];
    return results
        .filter(movieData => movieData.id && movieData.title)
        .map(movieData => new Movie(movieData));
};

// BUSINESS LOGIC: Get now playing movies for carousel
const getNowPlayingMovies = (movies, limit = 5) => {
    return movies
        .slice(0, limit)
        .map(movie => movie.getDisplayData());
};
// Get popular movies for grid
const getPopularMovies = (movies, limit = 12) => {
    return movies
        .slice(0, limit)
        .map(movie => movie.getDisplayData());
};

//Get upcoming movies for grid
const getUpcomingMovies = (movies, limit = 12) => {
    return movies
        .slice(0, limit)
        .map(movie => movie.getDisplayData());
};
//Get type of genre movies
const getGenreOptions = [
    { value: 28, label: 'Action' },
    { value: 35, label: 'Comedy' },
    { value: 80, label: 'Crime' },
    { value: 18, label: 'Drama' },
    { value: 27, label: 'Horror' },
    { value: 10749, label: 'Romance' }
];
const DEFAULT_GENRE_VALUE = 10749;
const getMovieByGenre = (movies, limit = 20) => {
    return movies
        .filter(movie => movie.genre === DEFAULT_GENRE_VALUE)
        .slice(0, limit)
        .map(movie => movie.getDisplayData());
}
const getDefaultGenreOption = () =>
    getGenreOptions.find(option => Number(option.value) === Number(DEFAULT_GENRE_VALUE)) || getGenreOptions[0];
// Get movie by index (for carousel)
const getMovieByIndex = (movies, index) => {

    if (index >= 0 && index < movies.length) {
        return movies[index].getDisplayData();
    }
    return null;
};

// Get default featured movie
const getDefaultFeaturedMovie = (movies) => {
    return movies.length > 0 ? movies[0].getDisplayData() : null;
};

const isValid = (movies) => {
    return movies.length > 0;
};



export const createHomepageData = (rawData) => {
    const data = rawData || {};
    const movies = processMovies(data);

    return {
        rawData: data,
        movies,
        getNowPlayingMovies: (limit) => getNowPlayingMovies(movies, limit),
        getPopularMovies: (limit) => getPopularMovies(movies, limit),
        getUpcomingMovies: (limit) => getUpcomingMovies(movies, limit),
        getGenreOptions: () => getGenreOptions,
        getMovieByGenre: (limit) => getMovieByGenre(movies, limit),
        DEFAULT_GENRE_VALUE: () => DEFAULT_GENRE_VALUE,
        getDefaultGenreOption: () => getDefaultGenreOption(),
        getMovieByIndex: (index) => getMovieByIndex(movies, index),
        getDefaultFeaturedMovie: () => getDefaultFeaturedMovie(movies),
        isValid: () => isValid(movies),
    };
};
