// src/shared/components/SecureForm.jsx
import React, { useState, useCallback } from 'react';
import { XSSProtection, InputValidator, SecurityMonitor } from '../security';

/**
 * 🛡️ Secure Form Component
 * Provides secure form handling with real-time validation and XSS protection
 */
export const SecureForm = ({
    onSubmit,
    children,
    className = '',
    validateOnChange = true,
    sanitizeOnChange = true,
    ...props
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Get form data
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            // Sanitize all form data
            const sanitizedData = {};
            for (const [key, value] of Object.entries(data)) {
                sanitizedData[key] = XSSProtection.sanitizeInput(value);
            }

            // Log form submission attempt
            SecurityMonitor.logSecurityEvent('FORM_SUBMISSION', {
                formFields: Object.keys(sanitizedData)
            });

            // Call the provided onSubmit handler
            if (onSubmit) {
                await onSubmit(sanitizedData, event);
            }

        } catch (error) {
            SecurityMonitor.logSecurityEvent('FORM_SUBMISSION_ERROR', {
                error: error.message
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [onSubmit, isSubmitting]);

    return (
        <form
            onSubmit={handleSubmit}
            className={`secure-form ${className}`}
            noValidate
            {...props}
        >
            {children}
            {isSubmitting && (
                <div className="form-loading" aria-live="polite">
                    Submitting...
                </div>
            )}
        </form>
    );
};

/**
 * 🔒 Secure Input Component
 */
export const SecureInput = ({
    type = 'text',
    name,
    value = '',
    onChange,
    onBlur,
    validation,
    sanitize = true,
    className = '',
    error,
    ...props
}) => {
    const [internalError, setInternalError] = useState('');
    const [isTouched, setIsTouched] = useState(false);

    const handleChange = useCallback((event) => {
        let inputValue = event.target.value;

        // Sanitize input if enabled
        if (sanitize) {
            inputValue = XSSProtection.sanitizeInput(inputValue);

            // Update the input value if it was sanitized
            if (inputValue !== event.target.value) {
                event.target.value = inputValue;
            }
        }

        // Validate input if validation function provided
        if (validation && isTouched) {
            const validationResult = validation(inputValue);
            if (!validationResult.valid) {
                setInternalError(validationResult.error || 'Invalid input');
            } else {
                setInternalError('');
            }
        }

        // Call the provided onChange handler
        if (onChange) {
            onChange(event);
        }
    }, [onChange, validation, sanitize, isTouched]);

    const handleBlur = useCallback((event) => {
        setIsTouched(true);

        // Validate on blur
        if (validation) {
            const validationResult = validation(event.target.value);
            if (!validationResult.valid) {
                setInternalError(validationResult.error || 'Invalid input');
            } else {
                setInternalError('');
            }
        }

        if (onBlur) {
            onBlur(event);
        }
    }, [onBlur, validation]);

    const displayError = error || internalError;

    return (
        <div className={`secure-input-wrapper ${className}`}>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`secure-input ${displayError ? 'has-error' : ''}`}
                aria-invalid={!!displayError}
                aria-describedby={displayError ? `${name}-error` : undefined}
                {...props}
            />
            {displayError && (
                <div
                    id={`${name}-error`}
                    className="input-error"
                    role="alert"
                >
                    {displayError}
                </div>
            )}
        </div>
    );
};

/**
 * 🔐 Secure Password Input Component
 */
export const SecurePasswordInput = ({
    name = 'password',
    value = '',
    onChange,
    onBlur,
    showStrengthIndicator = true,
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(null);

    const validatePassword = useCallback((password) => {
        const result = InputValidator.validatePassword(password);
        setStrength(result);
        return result;
    }, []);

    const getStrengthColor = () => {
        if (!strength) return 'gray';
        if (strength.valid) return 'green';
        if (strength.errors.length <= 2) return 'orange';
        return 'red';
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`secure-password-wrapper ${className}`}>
            <div className="password-input-container">
                <SecureInput
                    type={showPassword ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    validation={validatePassword}
                    className="password-input"
                    {...props}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
            </div>

            {showStrengthIndicator && strength && (
                <div className="password-strength">
                    <div
                        className="strength-bar"
                        style={{
                            backgroundColor: getStrengthColor(),
                            width: strength.valid ? '100%' : `${Math.max(20, 80 - (strength.errors.length * 20))}%`
                        }}
                    />
                    {!strength.valid && (
                        <ul className="strength-errors">
                            {strength.errors.map((error, index) => (
                                <li key={index} className="strength-error">
                                    {error}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * 📧 Secure Email Input Component
 */
export const SecureEmailInput = ({
    name = 'email',
    value = '',
    onChange,
    onBlur,
    className = '',
    ...props
}) => {
    const validateEmail = useCallback((email) => {
        const isValid = InputValidator.isValidEmail(email);
        return {
            valid: isValid,
            error: isValid ? '' : 'Please enter a valid email address'
        };
    }, []);

    return (
        <SecureInput
            type="email"
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            validation={validateEmail}
            className={`secure-email ${className}`}
            autoComplete="email"
            {...props}
        />
    );
};

/**
 * 🔍 Secure Search Input Component
 */
export const SecureSearchInput = ({
    name = 'search',
    value = '',
    onChange,
    onSearch,
    className = '',
    placeholder = 'Search...',
    ...props
}) => {
    const [searchQuery, setSearchQuery] = useState(value);

    const validateSearch = useCallback((query) => {
        return InputValidator.validateSearchInput(query);
    }, []);

    const handleChange = useCallback((event) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);

        if (onChange) {
            onChange(event);
        }
    }, [onChange]);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();

        const validation = validateSearch(searchQuery);
        if (validation.valid && onSearch) {
            onSearch(validation.sanitized);
        }
    }, [searchQuery, onSearch, validateSearch]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter') {
            handleSubmit(event);
        }
    }, [handleSubmit]);

    return (
        <div className={`secure-search-wrapper ${className}`}>
            <SecureInput
                type="search"
                name={name}
                value={searchQuery}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                validation={validateSearch}
                placeholder={placeholder}
                className="secure-search"
                {...props}
            />
            <button
                type="button"
                onClick={handleSubmit}
                className="search-button"
                aria-label="Search"
            >
                🔍
            </button>
        </div>
    );
};

export default SecureForm;
