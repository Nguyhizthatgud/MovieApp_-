// 🔐 Environment Validation Utility
// src/shared/utils/envValidator.js

/**
 * Validates required environment variables at application startup
 */
export class EnvironmentValidator {
    static requiredVars = [
        'REACT_APP_TMDB_API_KEY',
        'REACT_APP_TMDB_ACCESS_TOKEN'
    ];

    static optionalVars = [
        'REACT_APP_API_BASE_URL',
        'REACT_APP_ENABLE_CACHING',
        'REACT_APP_ENABLE_ANALYTICS'
    ];

    /**
     * Validate all required environment variables
     */
    static validate() {
        const missing = [];
        const warnings = [];

        // Check required variables
        this.requiredVars.forEach(varName => {
            const value = process.env[varName];

            if (!value || value.trim() === '') {
                missing.push(varName);
            } else if (value === 'your_api_key_here' || value === 'your_access_token_here') {
                warnings.push(`${varName} appears to be a placeholder value`);
            }
        });

        // Check optional variables
        this.optionalVars.forEach(varName => {
            const value = process.env[varName];
            if (!value) {
                warnings.push(`Optional variable ${varName} is not set - using default`);
            }
        });

        // Handle results
        if (missing.length > 0) {
            const error = new Error(
                `❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
                `Please check your .env file and ensure all required variables are set.`
            );
            error.missingVars = missing;
            throw error;
        }

        if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Environment warnings:');
            warnings.forEach(warning => console.warn(`  - ${warning}`));
        }

        console.log('✅ Environment validation passed');
        return true;
    }

    /**
     * Check if API keys appear to be valid format
     */
    static validateApiKeyFormat() {
        const apiKey = process.env.REACT_APP_TMDB_API_KEY;
        const accessToken = process.env.REACT_APP_TMDB_ACCESS_TOKEN;

        const warnings = [];

        // Basic format validation
        if (apiKey && apiKey.length < 20) {
            warnings.push('TMDB API key appears to be too short');
        }

        if (accessToken && !accessToken.includes('.')) {
            warnings.push('TMDB access token does not appear to be a JWT');
        }

        if (warnings.length > 0) {
            console.warn('⚠️ API key format warnings:');
            warnings.forEach(warning => console.warn(`  - ${warning}`));
        }
    }

    /**
     * Get sanitized environment info for debugging
     */
    static getDebugInfo() {
        return {
            nodeEnv: process.env.NODE_ENV,
            hasApiKey: !!process.env.REACT_APP_TMDB_API_KEY,
            hasAccessToken: !!process.env.REACT_APP_TMDB_ACCESS_TOKEN,
            baseUrl: process.env.REACT_APP_API_BASE_URL || 'default',
            enableCaching: process.env.REACT_APP_ENABLE_CACHING !== 'false',
            enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
        };
    }
}

/**
 * Initialize environment validation
 * Call this at the start of your application
 */
export const initializeEnvironment = () => {
    try {
        EnvironmentValidator.validate();
        EnvironmentValidator.validateApiKeyFormat();

        if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Environment Debug Info:', EnvironmentValidator.getDebugInfo());
        }

        return true;
    } catch (error) {
        console.error('💥 Environment initialization failed:', error.message);

        if (process.env.NODE_ENV === 'development') {
            console.error('\n📋 Quick Fix:');
            console.error('1. Check your .env file exists in the project root');
            console.error('2. Ensure all required variables are set');
            console.error('3. Restart your development server');
            console.error('4. Check the ENV_SECURITY_GUIDE.md for detailed instructions\n');
        }

        throw error;
    }
};

export default EnvironmentValidator;
