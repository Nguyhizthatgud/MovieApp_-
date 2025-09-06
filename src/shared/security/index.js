// src/shared/security/index.js
import DOMPurify from 'dompurify';

/**
 * 🛡️ XSS Prevention Utilities
 */
export class XSSProtection {
    /**
     * Sanitize HTML content to prevent XSS
     */
    static sanitizeHTML(dirty) {
        if (!dirty || typeof dirty !== 'string') return '';

        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
            ALLOWED_ATTR: [],
            ALLOW_DATA_ATTR: false
        });
    }

    /**
     * Sanitize user input for display
     */
    static sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';

        return input
            .replace(/[<>]/g, '') // Remove HTML brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim()
            .substring(0, 1000); // Limit length
    }

    /**
     * Encode HTML entities
     */
    static encodeHTML(text) {
        if (!text || typeof text !== 'string') return '';

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Validate and sanitize URL
     */
    static sanitizeURL(url) {
        if (!url || typeof url !== 'string') return '';

        try {
            const urlObj = new URL(url);

            // Only allow specific protocols
            const allowedProtocols = ['http:', 'https:', 'mailto:'];
            if (!allowedProtocols.includes(urlObj.protocol)) {
                return '';
            }

            return urlObj.toString();
        } catch (error) {
            return '';
        }
    }
}

/**
 * 🔍 Input Validation Utilities
 */
export class InputValidator {
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    /**
     * Validate password strength
     */
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, errors: ['Password is required'] };
        }

        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate movie search input
     */
    static validateSearchInput(query) {
        if (!query || typeof query !== 'string') {
            return { valid: false, error: 'Search query is required' };
        }

        const sanitized = XSSProtection.sanitizeInput(query);

        if (sanitized.length < 2) {
            return { valid: false, error: 'Search query must be at least 2 characters' };
        }

        if (sanitized.length > 100) {
            return { valid: false, error: 'Search query is too long' };
        }

        return { valid: true, sanitized };
    }

    /**
     * Validate movie rating input
     */
    static validateRating(rating) {
        const numRating = Number(rating);

        if (isNaN(numRating) || numRating < 1 || numRating > 10) {
            return { valid: false, error: 'Rating must be between 1 and 10' };
        }

        return { valid: true, sanitized: numRating };
    }
}

/**
 * 🔒 CSRF Protection Utilities
 */
export class CSRFProtection {
    static generateToken() {
        // Generate random token
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static setCSRFToken(token) {
        sessionStorage.setItem('csrf_token', token);

        // Set as meta tag for API requests
        let metaTag = document.querySelector('meta[name="csrf-token"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'csrf-token';
            document.head.appendChild(metaTag);
        }
        metaTag.content = token;
    }

    static getCSRFToken() {
        return sessionStorage.getItem('csrf_token') ||
            document.querySelector('meta[name="csrf-token"]')?.content;
    }

    static validateCSRFToken(token) {
        const storedToken = this.getCSRFToken();
        return storedToken && storedToken === token;
    }
}

/**
 * 🔐 Secure Storage Utilities
 */
export class SecureStorage {
    /**
     * Simple encoding (not for highly sensitive data)
     */
    static encode(data) {
        try {
            const jsonString = JSON.stringify(data);
            return btoa(jsonString);
        } catch (error) {
            console.error('Encoding failed:', error);
            return null;
        }
    }

    static decode(encodedData) {
        try {
            const jsonString = atob(encodedData);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Decoding failed:', error);
            return null;
        }
    }

    /**
     * Secure localStorage wrapper
     */
    static setSecureItem(key, value) {
        const encoded = this.encode(value);
        if (encoded) {
            localStorage.setItem(key, encoded);
            return true;
        }
        return false;
    }

    static getSecureItem(key) {
        const encoded = localStorage.getItem(key);
        if (encoded) {
            return this.decode(encoded);
        }
        return null;
    }

    /**
     * Secure sessionStorage wrapper
     */
    static setSecureSessionItem(key, value) {
        const encoded = this.encode(value);
        if (encoded) {
            sessionStorage.setItem(key, encoded);
            return true;
        }
        return false;
    }

    static getSecureSessionItem(key) {
        const encoded = sessionStorage.getItem(key);
        if (encoded) {
            return this.decode(encoded);
        }
        return null;
    }
}

/**
 * 🔍 API Security Utilities
 */
export class APISecurityHelpers {
    /**
     * Add security headers to API requests
     */
    static addSecurityHeaders(config = {}) {
        const csrfToken = CSRFProtection.getCSRFToken();

        return {
            ...config,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
                ...config.headers
            }
        };
    }

    /**
     * Sanitize API response data
     */
    static sanitizeResponseData(data) {
        if (typeof data === 'string') {
            return XSSProtection.sanitizeHTML(data);
        }

        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeResponseData(item));
        }

        if (data && typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeResponseData(value);
            }
            return sanitized;
        }

        return data;
    }
}

/**
 * 📊 Runtime Security Monitor
 */
export class SecurityMonitor {
    static securityEvents = [];
    static maxEvents = 100;

    /**
     * Log security event
     */
    static logSecurityEvent(type, details) {
        const event = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.securityEvents.push(event);

        // Keep only recent events
        if (this.securityEvents.length > this.maxEvents) {
            this.securityEvents = this.securityEvents.slice(-this.maxEvents);
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.warn('🛡️ Security Event:', event);
        }
    }

    /**
     * Get recent security events
     */
    static getSecurityEvents() {
        return [...this.securityEvents];
    }
}

// Export all utilities
export default {
    XSSProtection,
    InputValidator,
    CSRFProtection,
    SecureStorage,
    APISecurityHelpers,
    SecurityMonitor
};
