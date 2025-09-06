# Frontend Security Implementation Guide

## 🛡️ **Frontend Security Essentials**

Frontend security protects against:

- 🕷️ **XSS (Cross-Site Scripting)** attacks
- 🔒 **CSRF (Cross-Site Request Forgery)** attacks
- 📡 **Data exposure** and leakage
- 🌐 **Insecure communications**
- 🔐 **Authentication vulnerabilities**
- 📊 **Sensitive data in client-side code**

## 🏗️ **Security Architecture for Movie App**

```
Frontend Security Layers
├── Input Sanitization & Validation
├── XSS Prevention
├── CSRF Protection
├── Secure Authentication
├── Data Encryption
├── Content Security Policy (CSP)
├── Secure Headers
└── Runtime Security Monitoring
```

## 🛠️ **Implementation Files**

### **1. Security Utilities (`src/shared/security/index.js`)**

```javascript
// src/shared/security/index.js
import DOMPurify from "dompurify";
import CryptoJS from "crypto-js";

/**
 * XSS Prevention Utilities
 */
export class XSSProtection {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHTML(dirty) {
    if (!dirty || typeof dirty !== "string") return "";

    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false
    });
  }

  /**
   * Sanitize user input for display
   */
  static sanitizeInput(input) {
    if (!input || typeof input !== "string") return "";

    return input
      .replace(/[<>]/g, "") // Remove HTML brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Encode HTML entities
   */
  static encodeHTML(text) {
    if (!text || typeof text !== "string") return "";

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeURL(url) {
    if (!url || typeof url !== "string") return "";

    try {
      const urlObj = new URL(url);

      // Only allow specific protocols
      const allowedProtocols = ["http:", "https:", "mailto:"];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return "";
      }

      // Block dangerous domains (you can expand this list)
      const blockedDomains = ["javascript", "data", "vbscript"];
      if (blockedDomains.some((domain) => urlObj.hostname.includes(domain))) {
        return "";
      }

      return urlObj.toString();
    } catch (error) {
      return "";
    }
  }
}

/**
 * Input Validation Utilities
 */
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    if (!email || typeof email !== "string") return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    if (!password || typeof password !== "string") {
      return { valid: false, errors: ["Password is required"] };
    }

    const errors = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
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
    if (!query || typeof query !== "string") {
      return { valid: false, error: "Search query is required" };
    }

    const sanitized = XSSProtection.sanitizeInput(query);

    if (sanitized.length < 2) {
      return { valid: false, error: "Search query must be at least 2 characters" };
    }

    if (sanitized.length > 100) {
      return { valid: false, error: "Search query is too long" };
    }

    return { valid: true, sanitized };
  }

  /**
   * Validate movie rating input
   */
  static validateRating(rating) {
    const numRating = Number(rating);

    if (isNaN(numRating) || numRating < 1 || numRating > 10) {
      return { valid: false, error: "Rating must be between 1 and 10" };
    }

    return { valid: true, sanitized: numRating };
  }
}

/**
 * CSRF Protection Utilities
 */
export class CSRFProtection {
  static generateToken() {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  static setCSRFToken(token) {
    sessionStorage.setItem("csrf_token", token);

    // Set as meta tag for API requests
    let metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "csrf-token";
      document.head.appendChild(metaTag);
    }
    metaTag.content = token;
  }

  static getCSRFToken() {
    return sessionStorage.getItem("csrf_token") || document.querySelector('meta[name="csrf-token"]')?.content;
  }

  static validateCSRFToken(token) {
    const storedToken = this.getCSRFToken();
    return storedToken && storedToken === token;
  }
}

/**
 * Secure Storage Utilities
 */
export class SecureStorage {
  static encryptionKey = process.env.VITE_ENCRYPTION_KEY || "default-key-change-me";

  /**
   * Encrypt sensitive data before storing
   */
  static encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      return CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    }
  }

  /**
   * Decrypt sensitive data after retrieving
   */
  static decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }

  /**
   * Secure localStorage wrapper
   */
  static setSecureItem(key, value) {
    const encrypted = this.encrypt(value);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
      return true;
    }
    return false;
  }

  /**
   * Secure localStorage retrieval
   */
  static getSecureItem(key) {
    const encrypted = localStorage.getItem(key);
    if (encrypted) {
      return this.decrypt(encrypted);
    }
    return null;
  }

  /**
   * Secure sessionStorage wrapper
   */
  static setSecureSessionItem(key, value) {
    const encrypted = this.encrypt(value);
    if (encrypted) {
      sessionStorage.setItem(key, encrypted);
      return true;
    }
    return false;
  }

  /**
   * Secure sessionStorage retrieval
   */
  static getSecureSessionItem(key) {
    const encrypted = sessionStorage.getItem(key);
    if (encrypted) {
      return this.decrypt(encrypted);
    }
    return null;
  }
}

/**
 * API Security Utilities
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
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        ...config.headers
      }
    };
  }

  /**
   * Validate API response
   */
  static validateResponse(response) {
    // Check for suspicious response patterns
    if (response.headers && response.headers["content-type"]) {
      const contentType = response.headers["content-type"];

      // Ensure JSON responses are actually JSON
      if (contentType.includes("application/json")) {
        try {
          if (typeof response.data === "string") {
            JSON.parse(response.data);
          }
        } catch (error) {
          throw new Error("Invalid JSON response");
        }
      }
    }

    return response;
  }

  /**
   * Sanitize API response data
   */
  static sanitizeResponseData(data) {
    if (typeof data === "string") {
      return XSSProtection.sanitizeHTML(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeResponseData(item));
    }

    if (data && typeof data === "object") {
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
 * Runtime Security Monitor
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
    if (process.env.NODE_ENV === "development") {
      console.warn("Security Event:", event);
    }

    // Send to security monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.reportSecurityEvent(event);
    }
  }

  /**
   * Report security event to monitoring service
   */
  static async reportSecurityEvent(event) {
    try {
      // This would send to your security monitoring service
      await fetch("/api/security/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error("Failed to report security event:", error);
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
```

### **2. Secure Authentication Hook (`src/shared/hooks/useSecureAuth.js`)**

```javascript
// src/shared/hooks/useSecureAuth.js
import { useState, useEffect, useCallback } from "react";
import { SecureStorage, CSRFProtection, SecurityMonitor } from "../security";

export const useSecureAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authErrors, setAuthErrors] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored auth token
        const authData = SecureStorage.getSecureItem("auth_data");

        if (authData && authData.token && authData.expiresAt) {
          // Check if token is still valid
          if (new Date(authData.expiresAt) > new Date()) {
            setUser(authData.user);
            setIsAuthenticated(true);

            // Generate new CSRF token
            const csrfToken = CSRFProtection.generateToken();
            CSRFProtection.setCSRFToken(csrfToken);
          } else {
            // Token expired, clear storage
            await logout();
          }
        }
      } catch (error) {
        SecurityMonitor.logSecurityEvent("AUTH_INIT_ERROR", {
          error: error.message
        });
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Secure login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setAuthErrors(null);

      // Validate credentials
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required");
      }

      // Generate CSRF token for the login request
      const csrfToken = CSRFProtection.generateToken();
      CSRFProtection.setCSRFToken(csrfToken);

      // Make login request
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const authData = await response.json();

      // Validate response structure
      if (!authData.token || !authData.user) {
        throw new Error("Invalid authentication response");
      }

      // Calculate token expiration (assume 24 hours if not provided)
      const expiresAt = authData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Store auth data securely
      const secureAuthData = {
        token: authData.token,
        user: authData.user,
        expiresAt
      };

      SecureStorage.setSecureItem("auth_data", secureAuthData);

      // Update state
      setUser(authData.user);
      setIsAuthenticated(true);

      SecurityMonitor.logSecurityEvent("LOGIN_SUCCESS", {
        userId: authData.user.id,
        email: authData.user.email
      });

      return { success: true, user: authData.user };
    } catch (error) {
      SecurityMonitor.logSecurityEvent("LOGIN_FAILED", {
        error: error.message,
        email: credentials.email
      });

      setAuthErrors(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Secure logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API if user is authenticated
      if (isAuthenticated) {
        const csrfToken = CSRFProtection.getCSRFToken();

        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
          }
        });
      }

      SecurityMonitor.logSecurityEvent("LOGOUT", {
        userId: user?.id
      });
    } catch (error) {
      SecurityMonitor.logSecurityEvent("LOGOUT_ERROR", {
        error: error.message
      });
    } finally {
      // Clear all auth data
      SecureStorage.setSecureItem("auth_data", null);
      sessionStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setAuthErrors(null);
    }
  }, [isAuthenticated, user]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const authData = SecureStorage.getSecureItem("auth_data");

      if (!authData || !authData.token) {
        throw new Error("No auth token found");
      }

      const csrfToken = CSRFProtection.getCSRFToken();

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
          "X-CSRF-Token": csrfToken
        }
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const newAuthData = await response.json();

      // Update stored auth data
      const updatedAuthData = {
        ...authData,
        token: newAuthData.token,
        expiresAt: newAuthData.expiresAt
      };

      SecureStorage.setSecureItem("auth_data", updatedAuthData);

      return true;
    } catch (error) {
      SecurityMonitor.logSecurityEvent("TOKEN_REFRESH_FAILED", {
        error: error.message
      });

      await logout();
      return false;
    }
  }, [logout]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      const authData = SecureStorage.getSecureItem("auth_data");

      if (authData && authData.expiresAt) {
        const expiresAt = new Date(authData.expiresAt);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();

        // Refresh token 5 minutes before expiration
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          refreshToken();
        } else if (timeUntilExpiry <= 0) {
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken, logout]);

  return {
    user,
    isAuthenticated,
    loading,
    authErrors,
    login,
    logout,
    refreshToken,
    clearErrors: () => setAuthErrors(null)
  };
};
```

### **3. Secure API Client (`src/shared/services/api/secureClient.js`)**

```javascript
// src/shared/services/api/secureClient.js
import axios from "axios";
import { APISecurityHelpers, CSRFProtection, SecurityMonitor, SecureStorage } from "../../security";

class SecureApiClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - add security headers
    this.client.interceptors.request.use(
      (config) => {
        // Add security headers
        config = APISecurityHelpers.addSecurityHeaders(config);

        // Add auth token if available
        const authData = SecureStorage.getSecureItem("auth_data");
        if (authData && authData.token) {
          config.headers.Authorization = `Bearer ${authData.token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === "development") {
          console.log("🚀 Secure API Request:", config.method?.toUpperCase(), config.url);
        }

        return config;
      },
      (error) => {
        SecurityMonitor.logSecurityEvent("REQUEST_ERROR", {
          error: error.message
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor - validate and sanitize
    this.client.interceptors.response.use(
      (response) => {
        // Validate response
        APISecurityHelpers.validateResponse(response);

        // Sanitize response data
        response.data = APISecurityHelpers.sanitizeResponseData(response.data);

        return response;
      },
      (error) => {
        // Handle auth errors
        if (error.response?.status === 401) {
          SecurityMonitor.logSecurityEvent("UNAUTHORIZED_ACCESS", {
            url: error.config?.url,
            method: error.config?.method
          });

          // Clear auth data and redirect to login
          SecureStorage.setSecureItem("auth_data", null);
          window.location.href = "/login";
        }

        // Handle CSRF errors
        if (error.response?.status === 403) {
          SecurityMonitor.logSecurityEvent("CSRF_ERROR", {
            url: error.config?.url
          });
        }

        // Log other errors
        if (error.response?.status >= 500) {
          SecurityMonitor.logSecurityEvent("SERVER_ERROR", {
            status: error.response.status,
            url: error.config?.url
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Secure GET request
  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Secure POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Secure PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Secure DELETE request
  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new Error(data.message || `Server error: ${status}`);
    } else if (error.request) {
      // Network error
      SecurityMonitor.logSecurityEvent("NETWORK_ERROR", {
        error: error.message
      });
      return new Error("Network error: Please check your connection");
    } else {
      // Other error
      return new Error(error.message);
    }
  }
}

// Export secure client instances
export const secureApiClient = new SecureApiClient(process.env.VITE_API_BASE_URL || "http://localhost:3001/api");

export const tmdbSecureClient = new SecureApiClient("https://api.themoviedb.org/3");

export default secureApiClient;
```

### **4. Secure Form Components (`src/shared/components/forms/SecureForm.jsx`)**

```jsx
// src/shared/components/forms/SecureForm.jsx
import React, { useState, useCallback } from "react";
import { Form, Input, Button, Alert } from "antd";
import { InputValidator, XSSProtection, SecurityMonitor } from "../../security";

const SecureForm = ({ onSubmit, fields = [], submitText = "Submit", loading = false }) => {
  const [form] = Form.useForm();
  const [errors, setErrors] = useState({});
  const [securityAlerts, setSecurityAlerts] = useState([]);

  // Secure input handler
  const handleInputChange = useCallback(
    (fieldName, value) => {
      // Clear previous errors
      setErrors((prev) => ({ ...prev, [fieldName]: null }));

      // Find field configuration
      const fieldConfig = fields.find((f) => f.name === fieldName);
      if (!fieldConfig) return;

      // Validate based on field type
      let validation = { valid: true };

      switch (fieldConfig.type) {
        case "email":
          validation = InputValidator.isValidEmail(value)
            ? { valid: true }
            : { valid: false, error: "Please enter a valid email address" };
          break;

        case "password":
          validation = InputValidator.validatePassword(value);
          break;

        case "search":
          validation = InputValidator.validateSearchInput(value);
          break;

        case "text":
        default:
          // Basic sanitization for text inputs
          const sanitized = XSSProtection.sanitizeInput(value);
          if (sanitized !== value) {
            setSecurityAlerts((prev) => [
              ...prev,
              {
                type: "warning",
                message: "Some characters were removed for security reasons"
              }
            ]);

            SecurityMonitor.logSecurityEvent("XSS_ATTEMPT_BLOCKED", {
              field: fieldName,
              original: value,
              sanitized
            });
          }
          break;
      }

      // Set validation errors
      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: validation.error || validation.errors?.[0]
        }));
      }
    },
    [fields]
  );

  // Secure form submission
  const handleSubmit = useCallback(
    async (values) => {
      try {
        setErrors({});
        setSecurityAlerts([]);

        // Validate all fields
        const validatedData = {};
        const validationErrors = {};

        for (const field of fields) {
          const value = values[field.name];

          if (field.required && (!value || value.toString().trim() === "")) {
            validationErrors[field.name] = `${field.label} is required`;
            continue;
          }

          // Type-specific validation
          let validation = { valid: true, sanitized: value };

          switch (field.type) {
            case "email":
              if (value && !InputValidator.isValidEmail(value)) {
                validationErrors[field.name] = "Please enter a valid email address";
              } else {
                validatedData[field.name] = value?.toLowerCase().trim();
              }
              break;

            case "password":
              validation = InputValidator.validatePassword(value);
              if (!validation.valid) {
                validationErrors[field.name] = validation.errors[0];
              } else {
                validatedData[field.name] = value;
              }
              break;

            case "search":
              validation = InputValidator.validateSearchInput(value);
              if (!validation.valid) {
                validationErrors[field.name] = validation.error;
              } else {
                validatedData[field.name] = validation.sanitized;
              }
              break;

            default:
              validatedData[field.name] = XSSProtection.sanitizeInput(value);
              break;
          }
        }

        // If there are validation errors, display them
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }

        // Submit validated data
        await onSubmit(validatedData);
      } catch (error) {
        SecurityMonitor.logSecurityEvent("FORM_SUBMISSION_ERROR", {
          error: error.message
        });

        setSecurityAlerts([
          {
            type: "error",
            message: "An error occurred while submitting the form"
          }
        ]);
      }
    },
    [fields, onSubmit]
  );

  return (
    <div className="secure-form">
      {/* Security Alerts */}
      {securityAlerts.map((alert, index) => (
        <Alert
          key={index}
          type={alert.type}
          message={alert.message}
          showIcon
          closable
          onClose={() => setSecurityAlerts((prev) => prev.filter((_, i) => i !== index))}
          className="mb-4"
        />
      ))}

      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            validateStatus={errors[field.name] ? "error" : ""}
            help={errors[field.name]}
            rules={[
              {
                required: field.required,
                message: `${field.label} is required`
              }
            ]}
          >
            {field.type === "password" ? (
              <Input.Password
                placeholder={field.placeholder}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                autoComplete="new-password"
              />
            ) : (
              <Input
                type={field.type === "email" ? "email" : "text"}
                placeholder={field.placeholder}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                autoComplete={field.type === "email" ? "email" : "off"}
              />
            )}
          </Form.Item>
        ))}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {submitText}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SecureForm;
```

### **5. Security Package Installation**

```bash
# Install security dependencies
npm install dompurify crypto-js

# Optional: Additional security packages
npm install helmet js-cookie validator
```

### **6. Environment Variables (`.env`)**

```bash
# Security Configuration
VITE_ENCRYPTION_KEY=your-32-character-encryption-key-here
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_ENABLE_SECURITY_LOGGING=true

# API Keys (never commit real keys to version control)
VITE_TMDB_API_KEY=your-tmdb-api-key
VITE_TMDB_ACCESS_TOKEN=your-tmdb-access-token
```

## 🔒 **Security Best Practices Implementation**

### **1. Content Security Policy (CSP)**

Add to your `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.themoviedb.org;"
/>
```

### **2. Security Headers in Vite Config**

```javascript
// vite.config.js
export default {
  server: {
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    }
  }
};
```

## 🎯 **Integration with Your Movie App**

### **1. Update Homepage Controller**

```javascript
// Add to your existing HomepageController.js
import { InputValidator, XSSProtection, SecurityMonitor } from "@/shared/security";

// In your search handler
const handleMovieSearch = useCallback((query) => {
  const validation = InputValidator.validateSearchInput(query);

  if (!validation.valid) {
    setError(validation.error);
    return;
  }

  // Use sanitized query
  performSearch(validation.sanitized);
}, []);
```

This comprehensive security implementation protects your Movie App against common frontend vulnerabilities while maintaining excellent user experience! 🛡️✨
