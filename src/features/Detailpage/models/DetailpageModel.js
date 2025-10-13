export const createDetailMovie = (params) => {
    const movieDataType = {
        id: params.id,
        title: params.title,
        overview: params.overview,
        release_date: params.release_date,
        vote_average: params.vote_average,
        poster_path: params.poster_path || params.posterPath,
        backdrop_path: params.backdrop_path || params.backdropPath
    };
    const movieVideosType = {
        id: params.id,
        iso_639_1: params.iso_639_1,
        iso_3166_1: params.iso_3166_1,
        key: params.key,
        name: params.name,
        official: params.official,
        published_at: params.published_at,
        site: params.site,
        size: params.size,
        type: params.type
    };
    const movieCastType = {
        id: params.id,
        cast: params.cast,
        crew: params.crew
    };
    return {
        ...movieDataType,
        videos: movieVideosType,
        cast: movieCastType
    };
};
