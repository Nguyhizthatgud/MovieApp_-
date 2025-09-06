const detailMovies = (params) => {
    const movieDataType = {
        id: params.id,
        title: params.title,
        overview: params.overview,
        release_date: params.release_date,
        vote_average: params.vote_average,
        poster_path: params.poster_path,
        backdrop_path: params.backdrop_path
    };
    return movieDataType;
};
