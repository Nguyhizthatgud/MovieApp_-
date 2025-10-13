import React from 'react'
import { Empty, Spin } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { IoFilmOutline } from 'react-icons/io5';
import { API_CONFIG } from '../api/config.js';
import { Dropdown, Space } from 'antd';

export const SearchDropdownItem = ({
    loading,
    error,
    searchResults,
    movieSearchValue,
    selectedIndex,
    onMovieSelect,
    onViewAllResults
}) => {
    return (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-2xl z-50 border border-t-0 max-h-96 overflow-y-auto !p-2">
            {loading ? (
                <div className="!p-4 text-center">
                    <Spin />
                    <p className="mt-2 text-gray-500 text-sm">Searching for "{movieSearchValue}"...</p>
                </div>
            ) : error ? (
                <div className="!p-4 text-center">
                    <p className="text-red-500 text-sm">Error: {error}</p>
                </div>
            ) : searchResults && searchResults.length > 0 ? (
                <>
                    {/* "View All Results" Header */}
                    <div
                        className={`flex border-b border-gray-100 hover:bg-blue-50 cursor-pointer rounded-2xl !m-2 ${selectedIndex === -1 ? 'bg-blue-100' : 'bg-blue-25'}`}
                        onClick={onViewAllResults}
                    >
                        <div className="font-medium text-blue-600 flex items-center text-sm !m-2">
                            <IoFilmOutline className="!mr-1" />
                            View all results for "{movieSearchValue}"
                        </div>
                    </div>
                    {/* Movie Results */}
                    {searchResults.map((movie, index) => (
                        <div
                            key={movie.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 last:border-b-0 ${selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                            onClick={() => onMovieSelect(movie)}
                        >
                            <div className="flex-shrink-0">
                                <img
                                    src={movie.poster_path
                                        ? `${API_CONFIG.VITE_TMDB_IMAGE_BASE_URL}/w92${movie.poster_path}`
                                        : '/placeholder-movie.jpg'
                                    }
                                    alt={movie.title}
                                    className="w-12 h-16 object-cover rounded shadow-sm !m-1"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-movie.jpg';
                                    }}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate text-sm">
                                    {movie.title}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span>
                                        {movie.release_date
                                            ? new Date(movie.release_date).getFullYear()
                                            : 'N/A'
                                        }
                                    </span>
                                    {movie.vote_average > 0 && (
                                        <>
                                            <span>•</span>
                                            <div className="flex items-center gap-1 text-yellow-600">
                                                <StarFilled className="text-xs" />
                                                <span>{movie.vote_average.toFixed(1)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <div className="p-4">
                    <Empty
                        description={`No movies found for "${movieSearchValue}"`}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            )}
        </div>
    )
}

