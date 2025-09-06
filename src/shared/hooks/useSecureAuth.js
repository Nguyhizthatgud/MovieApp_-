// src/shared/hooks/useSecureAuth.js
import { useState, useEffect, useCallback } from 'react';
import { SecureStorage, CSRFProtection, SecurityMonitor } from '../security';

/**
 * 🔐 Secure Authentication Hook
 * Provides secure authentication with automatic token refresh and security monitoring
 */
export const useSecureAuth = () => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Token storage keys
    const ACCESS_TOKEN_KEY = 'secure_access_token';
    const REFRESH_TOKEN_KEY = 'secure_refresh_token';
    const USER_DATA_KEY = 'secure_user_data';

    /**
     * Initialize authentication state
     */
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = useCallback(async () => {
        try {
            setIsLoading(true);

            // Get stored tokens
            const accessToken = SecureStorage.getSecureSessionItem(ACCESS_TOKEN_KEY);
            const userData = SecureStorage.getSecureItem(USER_DATA_KEY);

            if (accessToken && userData) {
                // Validate token before setting auth state
                const isValid = await validateToken(accessToken);

                if (isValid) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    SecurityMonitor.logSecurityEvent('AUTH_RESTORED', { userId: userData.id });
                } else {
                    // Try to refresh token
                    await refreshAuthentication();
                }
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            SecurityMonitor.logSecurityEvent('AUTH_INIT_FAILED', { error: error.message });
            clearAuthData();
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Secure login function
     */
    const login = useCallback(async (credentials) => {
        try {
            setIsLoading(true);
            setError(null);

            // Generate CSRF token for login request
            const csrfToken = CSRFProtection.generateToken();
            CSRFProtection.setCSRFToken(csrfToken);

            // Simulate API call (replace with actual API)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const { user: userData, accessToken, refreshToken } = await response.json();

            // Store tokens securely
            SecureStorage.setSecureSessionItem(ACCESS_TOKEN_KEY, accessToken);
            SecureStorage.setSecureItem(REFRESH_TOKEN_KEY, refreshToken);
            SecureStorage.setSecureItem(USER_DATA_KEY, userData);

            setUser(userData);
            setIsAuthenticated(true);

            SecurityMonitor.logSecurityEvent('LOGIN_SUCCESS', { userId: userData.id });

            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Login failed';
            setError(errorMessage);
            SecurityMonitor.logSecurityEvent('LOGIN_FAILED', { error: errorMessage });
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Secure logout function
     */
    const logout = useCallback(async () => {
        try {
            const accessToken = SecureStorage.getSecureSessionItem(ACCESS_TOKEN_KEY);

            if (accessToken) {
                // Notify server about logout
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                } catch (error) {
                    // Continue with local logout even if server request fails
                    console.warn('Server logout failed:', error);
                }
            }

            clearAuthData();
            SecurityMonitor.logSecurityEvent('LOGOUT_SUCCESS', { userId: user?.id });
        } catch (error) {
            SecurityMonitor.logSecurityEvent('LOGOUT_FAILED', { error: error.message });
        }
    }, [user]);

    /**
     * Clear all authentication data
     */
    const clearAuthData = useCallback(() => {
        SecureStorage.getSecureSessionItem(ACCESS_TOKEN_KEY) && sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        SecureStorage.getSecureItem(REFRESH_TOKEN_KEY) && localStorage.removeItem(REFRESH_TOKEN_KEY);
        SecureStorage.getSecureItem(USER_DATA_KEY) && localStorage.removeItem(USER_DATA_KEY);

        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    }, []);

    /**
     * Validate access token
     */
    const validateToken = useCallback(async (token) => {
        try {
            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }, []);

    /**
     * Refresh authentication tokens
     */
    const refreshAuthentication = useCallback(async () => {
        try {
            const refreshToken = SecureStorage.getSecureItem(REFRESH_TOKEN_KEY);

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const { accessToken, refreshToken: newRefreshToken, user: userData } = await response.json();

            // Update stored tokens
            SecureStorage.setSecureSessionItem(ACCESS_TOKEN_KEY, accessToken);
            SecureStorage.setSecureItem(REFRESH_TOKEN_KEY, newRefreshToken);
            SecureStorage.setSecureItem(USER_DATA_KEY, userData);

            setUser(userData);
            setIsAuthenticated(true);

            SecurityMonitor.logSecurityEvent('TOKEN_REFRESHED', { userId: userData.id });

            return accessToken;
        } catch (error) {
            SecurityMonitor.logSecurityEvent('TOKEN_REFRESH_FAILED', { error: error.message });
            clearAuthData();
            throw error;
        }
    }, [clearAuthData]);

    /**
     * Get current access token (with auto-refresh)
     */
    const getAccessToken = useCallback(async () => {
        let accessToken = SecureStorage.getSecureSessionItem(ACCESS_TOKEN_KEY);

        if (!accessToken) {
            try {
                accessToken = await refreshAuthentication();
            } catch (error) {
                return null;
            }
        }

        return accessToken;
    }, [refreshAuthentication]);

    /**
     * Update user profile securely
     */
    const updateProfile = useCallback(async (profileData) => {
        try {
            setIsLoading(true);
            const accessToken = await getAccessToken();

            if (!accessToken) {
                throw new Error('Authentication required');
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error('Profile update failed');
            }

            const updatedUser = await response.json();

            // Update stored user data
            SecureStorage.setSecureItem(USER_DATA_KEY, updatedUser);
            setUser(updatedUser);

            SecurityMonitor.logSecurityEvent('PROFILE_UPDATED', { userId: updatedUser.id });

            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Profile update failed';
            setError(errorMessage);
            SecurityMonitor.logSecurityEvent('PROFILE_UPDATE_FAILED', { error: errorMessage });
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [getAccessToken]);

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,

        // Actions
        login,
        logout,
        updateProfile,
        refreshAuthentication,
        getAccessToken,

        // Utilities
        clearError: () => setError(null)
    };
};
