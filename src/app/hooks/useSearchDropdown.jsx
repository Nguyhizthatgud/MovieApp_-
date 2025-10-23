// Create: src/app/hooks/useSearchDropdown.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSearchDropdown = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);


    const openDropdown = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        setSelectedIndex(-1);
    }, []);

    // handle movie selection
    const handleMovieSelect = useCallback((movie) => {
        navigate(`/movie/${movie.id}`);
        console.log('Selected movie to open:', movie);
        closeDropdown();
    }, [navigate, closeDropdown]);

    // handle "View All Results"
    const handleViewAllResults = useCallback((searchQuery) => {
        if (searchQuery?.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            closeDropdown();
        }
    }, [navigate, closeDropdown]);

    return {
        // state
        isOpen,
        selectedIndex,
        dropdownRef,
        inputRef,

        // actions
        openDropdown,
        closeDropdown,
        handleMovieSelect,
        handleViewAllResults,

        // utils
        shouldShowDropdown: (searchValue, hasResults) => {
            return isOpen && searchValue && searchValue.length >= 2 && hasResults;
        }
    };
};