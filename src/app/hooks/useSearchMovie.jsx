import React from 'react';
import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../../shared/api/config.js';
export const useSearchMovie = (searchValue, debounce = 300) => {
    const [searchResults, setSearchResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [searchingService, setSearchingService] = React.useState(null);
    const geminiCacheRef = React.useRef({}); // Cache for Gemini responses
    const searchGemini = React.useCallback(async (query) => {
        // skip Gemini search if API key is not configured
        if (!API_CONFIG.GEMINI_API_KEY) {
            return null;
        }

        // Check cache first
        if (geminiCacheRef.current[query]) {
            // console.log('Returning cached Gemini result for:', query);
            return geminiCacheRef.current[query];
        }

        try {
            const response = await axios({
                method: 'POST',
                url: ENDPOINTS.SEARCH_MOVIE_AI(query),
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': API_CONFIG.GEMINI_API_KEY
                },
                data: {
                    contents: [{
                        parts: [{
                            text: `Find eight movie information for: "${query}". Return a JSON response with an array of movies containing id, title, overview, release_date, movie runtime, movie start rate, trailer src, backdrop_path and poster_path fields. Movie runtime is in minutes, movie start rate is out of 10, trailer src is the source of the trailer, budget, revenue, original language, production companies, production countries, spoken languages, genres, popularity, release status, rating class, popularity tier, backdrop_path is the path of the backdrop image, poster_path is the path of the poster image. The response should be in the following format: { "movies": [ { "id": 123, "title": "Movie Title", "overview": "Movie Overview", "release_date": "2024-01-01", "runtime": 120, "start_rate": 8.5, "trailer_src": "https://www.youtube.com/watch?v=1234567890", "budget": 100000000, "revenue": 200000000, "original_language": "en", "production_companies": ["Production Company"], "production_countries": ["US"], "spoken_languages": ["en"], "genres": ["Action"], "popularity": 100, "release_status": "Released", "rating_class": "PG-13", "popularity_tier": "High", "backdrop_path": "https://image.tmdb.org/t/p/w500/backdrop.jpg", "poster_path": "https://image.tmdb.org/t/p/w500/poster.jpg" } ] }`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                    }
                }
            });

            // Check if response has the expected structure
            if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
                // console.warn('Gemini response is not in expected structure:', response.data);
                return null;
            }

            // Check if the response has parts with text
            const candidate = response.data.candidates[0];
            if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
                // console.warn('Gemini response is not in expected parts structure:', candidate);
                return null;
            }

            const geminiText = candidate.content.parts[0].text;
            // console.log('Gemini raw text received:', geminiText);
            const regex = /```json\n([\s\S]*)\n```/; // what tha hel is this?
            const match = regex.exec(geminiText);

            if (match) {
                const jsonText = match[1];
                const parsedData = JSON.parse(jsonText);
                // Return extracted movies array if it exists
                let result = null;
                if (Array.isArray(parsedData)) {
                    result = parsedData;
                } else if (parsedData && Array.isArray(parsedData.movies)) {
                    result = parsedData.movies;
                } else if (parsedData && Array.isArray(parsedData.results)) {
                    result = parsedData.results;
                } else {
                    // console.warn('Parsed data does not contain expected array format:', parsedData);
                    return null;
                }
                // Cache the result
                if (result && Array.isArray(result)) {
                    geminiCacheRef.current[query] = result;
                    // console.log('Cached Gemini result for:', query);
                }
                return result;
            }
            // Try to parse the JSON response from Gemini
            try {
                // console.log('Attempting direct JSON parse (no code block)');
                const parsedData = JSON.parse(geminiText);
                // console.log('Direct parse successful:', parsedData);
                // Check if parsedData is an array or has an array property
                let result = null;
                if (Array.isArray(parsedData)) {
                    // console.log('Returning array data');
                    result = parsedData;
                } else if (parsedData && Array.isArray(parsedData.movies)) {
                    // console.log('Returning movies array');
                    result = parsedData.movies;
                } else if (parsedData && Array.isArray(parsedData.results)) {
                    // console.log('Returning results array');
                    result = parsedData.results;
                } else {
                    // console.warn('Gemini response is not in expected array format:', parsedData);
                    return null;
                }
                // Cache the result
                if (result && Array.isArray(result)) {
                    geminiCacheRef.current[query] = result;
                    // console.log('Cached Gemini result for:', query);
                }
                return result;
            } catch (parseError) {
                // console.warn('Failed to parse Gemini response as JSON:', geminiText);
                // console.warn('Parse error details:', parseError.message);
                return null;
            }
        }
        catch (error) {
            // Log specific error information for debugging
            if (error.response) {
                // API responded with error status
                // console.error('Gemini API Error:', error.response.status, error.response.data);
                if (error.response.status === 503) {
                    //console.warn('Gemini API is temporarily unavailable (503 Service Unavailable)');
                }
            } else if (error.request) {
                // Request made but no response
                // console.error('Gemini API No Response:', error.request);
            } else {
                // Error in request setup
                // console.error('Gemini API Error:', error.message);
            }
            return null;
        }
    }, []);
    React.useEffect(() => {
        if (!searchValue || searchValue.trim().length < 2) {
            setSearchResults([]);
            setError(null);
            setSearchingService(null);
            return;
        }
        // debounce ngay và luôn
        const searchMovies = setTimeout(async () => {
            setLoading(true);
            setSearchingService('tmdb');
            setError(null);
            try {
                const response = await axios({
                    method: 'GET',
                    url: `${ENDPOINTS.SEARCH_MOVIES}`,
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
                        'Accept': 'application/json'
                    },
                    params: {
                        query: searchValue.trim(),
                        page: 1,
                        include_adult: false
                    }
                });
                const movieResults = response.data.results?.slice(0, 8) || [];
                setSearchResults(movieResults);
                if (movieResults.length === 0) {
                    setSearchingService('gemini');
                    const geminiData = await searchGemini(searchValue.trim());
                    // console.log('Gemini data:', geminiData);
                    // console.log('Gemini data type:', typeof geminiData);
                    // console.log('Is array?', Array.isArray(geminiData));
                    if (geminiData) {
                        // console.log('Gemini data length:', geminiData.length);
                    }

                    // Check if geminiData exists and is an array
                    if (geminiData && Array.isArray(geminiData) && geminiData.length > 0) {
                        // Xử lý dữ liệu từ Gemini nếu cần thiết
                        const processedResults = [];
                        geminiData.forEach(item => {
                            // Check if item has required properties
                            if (item && typeof item === 'object') {
                                processedResults.push({
                                    id: item.id || null,
                                    title: item.title || 'Unknown Title',
                                    overview: item.overview || 'No overview available',
                                    runtime: item.runtime || 0,
                                    release_date: item.release_date || null,
                                    start_rate: item.start_rate || 0,
                                    trailer_src: item.trailer_src || null,
                                    backdrop_path: item.backdrop_path || null,
                                    poster_path: item.poster_path || null,
                                    spoken_languages: item.spoken_languages || [],
                                    budget: item.budget || 0,
                                    revenue: item.revenue || 0,
                                    original_language: item.original_language || null,
                                    production_companies: item.production_companies || [],
                                    production_countries: item.production_countries || [],
                                    genres: item.genres || [],
                                    popularity: item.popularity || 0,
                                    release_status: item.release_status || null,
                                    rating_class: item.rating_class || null,
                                    popularity_tier: item.popularity_tier || null,
                                });
                            }
                        });
                        // console.log('Processed results:', processedResults);
                        setSearchResults(processedResults);
                        setLoading(false);
                    } else {
                        // console.warn('No valid Gemini data received or empty array');
                        setSearchResults([]);
                        // Keep loading true to show loading spinner instead of "No movies found" message
                    }
                } else {
                    setLoading(false);
                }
            } catch (error) {
                // console.error('Error fetching search results:', error);
                setError(error.message || 'Failed to fetch search results');
                setSearchResults([]);
                setLoading(false);  // Set loading to false on error
            }
            finally {
                // console.log('Loading state set to false');
                setSearchingService(null);
            }
        }, debounce); // debounce 500ms

        return () => clearTimeout(searchMovies);
    }, [searchValue, debounce]);
    const clearSearch = React.useCallback(() => {
        setSearchResults([]);
        setError(null);
        setSearchingService(null);
    }, []);

    return { searchResults, loading, error, clearSearch, searchingService };
};