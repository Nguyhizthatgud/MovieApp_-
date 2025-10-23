// Update: src/features/Homepage/views/Homepage.jsx
import React from 'react';
import { MoviePopular } from './MoviePopular.jsx';
import { MovieUpcoming } from './MovieUpcoming.jsx';
import { MovieGenre } from './MovieGenre.jsx';
import { MovieHero } from './MovieHero.jsx';
import { useNowPlaying } from '../controllers/HomepageController.js';
import { usePopularMovies } from '../controllers/HomepageController.js';
import { useGenreMovie } from '../controllers/HomepageController.js';
import { useUpcomingMovies } from '../controllers/HomepageController.js';

import Errorpage from '../../../shared/components/Layout/Errorpage.jsx';

import { Spin, Skeleton, Progress } from 'antd';

const Homepage = () => {
    const { loading: nowPlayingLoading, error: nowPlayingError } = useNowPlaying();
    const { loading: popularLoading, error: popularError } = usePopularMovies();
    const { loading: upcomingLoading, error: upcomingError } = useUpcomingMovies();

    const [showContent, setShowContent] = React.useState(false);
    const [isDelayComplete, setIsDelayComplete] = React.useState(false);

    const isLoading = nowPlayingLoading || popularLoading || upcomingLoading;
    const isError = nowPlayingError || popularError || upcomingError;

    const loadingStates = [nowPlayingLoading, popularLoading, upcomingLoading];
    const completedCount = loadingStates.filter(state => !state).length;
    const progress = Math.round((completedCount / 3) * 100);

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    React.useEffect(() => {
        if (!isLoading && !isError) {
            // Add a delay before showing content
            const delayTimer = setTimeout(() => {
                setIsDelayComplete(true);
                // Add another small delay for smooth transition
                const contentTimer = setTimeout(() => {
                    setShowContent(true);
                }, 300);

                return () => clearTimeout(contentTimer);
            }, 1000); // 1 second delay after loading completes

            return () => clearTimeout(delayTimer);
        } else {
            // Reset states when loading starts again
            setShowContent(false);
            setIsDelayComplete(false);
        }
    }, [isLoading, isError]);

    if (isError) {
        return <Errorpage />;
    }

    // ✅ Show loading screen with progress
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <Spin size="large" />
                    <div className="!text-white">
                        <div className="text-xl mb-2">Loading Homepage...</div>
                        <Progress
                            percent={progress}
                            status="active"
                            strokeColor="#1890ff"
                        />
                        <div className="text-sm mt-2 !text-white">
                            {completedCount}/3 sections loaded
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Show completion screen during delay
    if (!isDelayComplete) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center space-y-6">

                    <div className="text-white">
                        <div className="text-xl mb-2">Preparing your experience...</div>
                        <Progress
                            percent={100}
                            status="success"
                            strokeColor="#52c41a"
                        />
                        <div className="text-sm mt-2 !text-white">
                            Ready to go! 🎬
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Show content with fade-in animation
    return (
        <div
            className={`min-h-screen bg-gray-500 text-white transition-all duration-1000 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
                }`}
        >
            {/* Hero Section */}
            <MovieHero />

            {/* Popular movies section */}
            <div className="">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
                <MoviePopular />
                {/* Trending movies section */}
                <MovieUpcoming />
                {/* Categories Section */}
                <MovieGenre />
            </div>
        </div>
    );
};

export default Homepage;