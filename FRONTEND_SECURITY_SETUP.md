# 🛡️ Frontend Security Implementation Guide

## Essential Security Measures for Your Movie App

### 1. **Content Security Policy (CSP)**

Add to your `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- 🔒 Content Security Policy -->
    <meta
      http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: https://image.tmdb.org;
        connect-src 'self' https://api.themoviedb.org https://*.tmdb.org;
        frame-src 'none';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
    "
    />

    <!-- 🔒 Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

    <title>Movie Discovery App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 2. **Environment Variables Security**

Create/update your `.env` file:

```env
# 🔐 API Configuration
<!-- VITE_TMDB_API_KEY=your_secure_api_key_here
VITE_TMDB_ACCESS_TOKEN=your_secure_access_token_here
VITE_TMDB_BASE_URL="xxx"

# 🔒 Security Configuration
<!-- VITE_ENABLE_HTTPS=true
VITE_CSP_REPORT_URI=https://your-domain.com/csp-report
VITE_ENVIRONMENT=production -->
```

### 3. **Input Validation & Sanitization**

Create `src/utils/security.js`:

```javascript
/**
 * 🛡️ Input Security Utilities
 */

// Sanitize HTML content
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== "string") return "";

  // Remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/<[^>]*>/g, (match) => {
      // Only allow safe tags
      const safeTags = ["b", "i", "em", "strong", "p", "br", "span"];
      const tagName = match.match(/<\/?([a-zA-Z]+)/)?.[1];
      return safeTags.includes(tagName) ? match : "";
    });
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validate search input
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== "string") return false;

  const sanitized = query.trim();
  return sanitized.length >= 2 && sanitized.length <= 100;
};

// Sanitize URL
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") return "";

  try {
    const urlObj = new URL(url);
    const allowedProtocols = ["http:", "https:"];

    if (!allowedProtocols.includes(urlObj.protocol)) {
      return "";
    }

    // Only allow specific domains for images
    const allowedDomains = ["image.tmdb.org", "themoviedb.org"];
    if (!allowedDomains.some((domain) => urlObj.hostname.includes(domain))) {
      return "";
    }

    return urlObj.toString();
  } catch {
    return "";
  }
};
```

### 4. **Secure API Client**

Update your `src/shared/api/secureApiClient.js`:

```javascript
import axios from "axios";
import { sanitizeUrl } from "../utils/security";

/**
 * 🛡️ Secure API Client with built-in security
 */
class SecureApiClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json"
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - Add security headers
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching
        config.headers["X-Timestamp"] = Date.now();

        // Validate URLs
        if (config.url) {
          config.url = sanitizeUrl(config.url);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Sanitize data
    this.client.interceptors.response.use(
      (response) => {
        // Sanitize response data
        if (response.data) {
          response.data = this.sanitizeResponseData(response.data);
        }
        return response;
      },
      (error) => {
        console.error("API Error:", error.message);
        return Promise.reject(error);
      }
    );
  }

  sanitizeResponseData(data) {
    if (typeof data === "string") {
      return sanitizeHtml(data);
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

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

// Create TMDB API client
const tmdbClient = new SecureApiClient(import.meta.env.VITE_TMDB_BASE_URL);

export { SecureApiClient, tmdbClient };
export default tmdbClient;
```

### 5. **Secure Form Component**

Create `src/components/SecureForm.jsx`:

```javascript
import React, { useState } from "react";
import { sanitizeHtml, validateEmail, validateSearchQuery } from "../utils/security";

/**
 * 🛡️ Secure Form Component with built-in validation
 */
export const SecureForm = ({ onSubmit, children, className = "" }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrors({});

      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());

      // Sanitize all form data
      const sanitizedData = {};
      for (const [key, value] of Object.entries(data)) {
        sanitizedData[key] = sanitizeHtml(value);
      }

      // Validate form data
      const validationErrors = validateFormData(sanitizedData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (onSubmit) {
        await onSubmit(sanitizedData, event);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ general: "Form submission failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateFormData = (data) => {
    const errors = {};

    // Email validation
    if (data.email && !validateEmail(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Search validation
    if (data.search && !validateSearchQuery(data.search)) {
      errors.search = "Search query must be 2-100 characters long";
    }

    return errors;
  };

  return (
    <form onSubmit={handleSubmit} className={`secure-form ${className}`} noValidate>
      {children}

      {Object.keys(errors).length > 0 && (
        <div className="form-errors" role="alert">
          {Object.entries(errors).map(([field, message]) => (
            <div key={field} className="error-message">
              {message}
            </div>
          ))}
        </div>
      )}

      {isSubmitting && (
        <div className="form-loading" aria-live="polite">
          Submitting...
        </div>
      )}
    </form>
  );
};

/**
 * 🛡️ Secure Input Component
 */
export const SecureInput = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || "");

  const handleChange = (event) => {
    const newValue = event.target.value;

    // Real-time sanitization for text inputs
    const sanitizedValue = type === "text" || type === "search" ? sanitizeHtml(newValue) : newValue;

    setInternalValue(sanitizedValue);

    if (onChange) {
      event.target.value = sanitizedValue;
      onChange(event);
    }
  };

  return (
    <input
      type={type}
      name={name}
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      className={`secure-input ${className}`}
      autoComplete={type === "email" ? "email" : type === "password" ? "current-password" : "off"}
      {...props}
    />
  );
};
```

### 6. **Security Monitoring**

Create `src/utils/securityMonitor.js`:

```javascript
/**
 * 🛡️ Security Event Monitoring
 */
class SecurityMonitor {
  constructor() {
    this.events = [];
    this.maxEvents = 100;
  }

  /**
   * Log security event
   */
  logEvent(type, details) {
    const event = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn("🛡️ Security Event:", event);
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToMonitoring(event);
    }
  }

  /**
   * Send event to monitoring service
   */
  async sendToMonitoring(event) {
    try {
      await fetch("/api/security-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error("Failed to send security event:", error);
    }
  }

  /**
   * Get recent security events
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Clear events
   */
  clearEvents() {
    this.events = [];
  }
}

// Create global instance
export const securityMonitor = new SecurityMonitor();

// Export convenience functions
export const logSecurityEvent = (type, details) => {
  securityMonitor.logEvent(type, details);
};

export default SecurityMonitor;
```

### 7. **HTTPS Configuration**

Update your `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    https: true, // Enable HTTPS in development
    host: true,
    port: 3000
  },
  build: {
    // Security-focused build options
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  // Environment variable validation
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
```

### 8. **Dependency Security**

Update your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "security:audit": "npm audit",
    "security:fix": "npm audit fix",
    "lint:security": "eslint src --ext .js,.jsx --plugin security"
  },
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.6.0",
    "dompurify": "^3.0.8" // For HTML sanitization
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-plugin-security": "^2.1.0", // Security linting
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0"
  }
}
```

### 9. **Security Headers (Server-side)**

If you have access to your server, add these headers:

```javascript
// Express.js example
app.use((req, res, next) => {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");

  // CSP header
  res.setHeader(
    "Content-Security-Policy",
    `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.themoviedb.org;
  `
      .replace(/\s+/g, " ")
      .trim()
  );

  next();
});
```

### 10. **Security Testing Checklist**

Create `SECURITY_CHECKLIST.md`:

```markdown
# 🔒 Security Implementation Checklist

## Frontend Security

- [ ] Content Security Policy implemented
- [ ] Security headers configured
- [ ] Input validation and sanitization
- [ ] XSS prevention measures
- [ ] CSRF protection
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Dependencies audited
- [ ] Security monitoring in place

## Testing

- [ ] XSS vulnerability testing
- [ ] CSRF token validation
- [ ] Input validation testing
- [ ] HTTPS certificate validation
- [ ] Security headers verification
- [ ] Dependency vulnerability scanning

## Monitoring

- [ ] Security event logging
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User activity monitoring
```

## 🚀 Quick Implementation Steps

1. **Add CSP headers** to `public/index.html`
2. **Create security utilities** in `src/utils/security.js`
3. **Update API client** with security interceptors
4. **Implement secure form components**
5. **Add security monitoring**
6. **Configure HTTPS** in development
7. **Audit dependencies** regularly
8. **Test security measures**

## 🔍 Security Testing Commands

```bash
# Check for vulnerabilities
npm audit

# Run security linting
npm run lint:security

# Test HTTPS
curl -I https://your-domain.com

# Check security headers
curl -I https://your-domain.com | grep -E "(X-|Content-Security)"
```

This comprehensive security setup will protect your Movie App from the most common frontend attacks! 🛡️

Would you like me to help you implement any specific security measure in your Movie App?
