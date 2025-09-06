# 🔐 Environment File Security Guide

## How to Secure Your .env File

### 🚨 Critical Security Steps

#### 1. Add .env to .gitignore (MOST IMPORTANT)

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# API Keys and Secrets
*.key
*.pem
secrets/
```

#### 2. File Permissions (Windows)

```cmd
# Set file permissions to restrict access
icacls .env /grant:r "%USERNAME%":F /inheritance:r
icacls .env /remove "Everyone"
icacls .env /remove "Users"
```

#### 3. Environment Variable Validation

```javascript
// In your config.js, validate environment variables
export const validateEnvironment = () => {
  const required = ["REACT_APP_TMDB_API_KEY", "REACT_APP_TMDB_ACCESS_TOKEN"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
```

### 🛡️ Advanced Security Measures

#### 1. Environment-Specific Files

```
.env                    # Default environment variables
.env.local             # Local overrides (never commit)
.env.development       # Development environment
.env.production        # Production environment (deploy securely)
.env.test             # Test environment
```

#### 2. API Key Rotation Strategy

```javascript
// In your secure API client
export class SecureApiClient {
  constructor() {
    this.apiKey = process.env.REACT_APP_TMDB_API_KEY;
    this.keyRotationCheck();
  }

  keyRotationCheck() {
    const keyAge = this.getKeyAge();
    if (keyAge > 90) {
      // 90 days
      console.warn("🔑 API key is older than 90 days - consider rotation");
    }
  }
}
```

#### 3. Runtime Environment Validation

```javascript
// Add to your main App.js
import { validateEnvironment } from "./shared/api/config";

function App() {
  useEffect(() => {
    try {
      validateEnvironment();
    } catch (error) {
      console.error("❌ Environment validation failed:", error.message);
      // Handle missing environment variables
    }
  }, []);

  return <div>Your App</div>;
}
```

### 🔒 Production Deployment Security

#### 1. CI/CD Environment Variables

```yaml
# GitHub Actions example
env:
  REACT_APP_TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
  REACT_APP_TMDB_ACCESS_TOKEN: ${{ secrets.TMDB_ACCESS_TOKEN }}
```

#### 2. Server Environment Variables

```bash
# On your production server
export REACT_APP_TMDB_API_KEY="your_secure_key"
export REACT_APP_TMDB_ACCESS_TOKEN="your_secure_token"

# Or use a secrets management service
# AWS Secrets Manager, Azure Key Vault, etc.
```

#### 3. Build-Time Security

```javascript
// vite.config.js - Filter sensitive variables
export default defineConfig({
  define: {
    "process.env.REACT_APP_TMDB_API_KEY": JSON.stringify(process.env.REACT_APP_TMDB_API_KEY)
    // Don't expose internal secrets
  }
});
```

### 🚫 What NOT to Do

1. **Never commit .env to Git**

   ```bash
   # BAD - Don't do this!
   git add .env
   git commit -m "Added API keys"
   ```

2. **Never hardcode secrets in source code**

   ```javascript
   // BAD - Don't do this!
   const API_KEY = "ac3395fe6e59218331dbbe8dcefabab3";
   ```

3. **Never share .env files directly**
   ```
   ❌ Email: "Here's my .env file..."
   ❌ Slack: "Check out my API keys..."
   ❌ Public repos with .env files
   ```

### ✅ Security Checklist

- [ ] .env is in .gitignore
- [ ] File permissions are restricted
- [ ] Environment variables are validated at runtime
- [ ] API keys are rotated regularly
- [ ] Production uses secure secret management
- [ ] No hardcoded secrets in source code
- [ ] Team members have individual API keys
- [ ] Monitoring for exposed secrets

### 🔧 Implementation Steps

1. **Check your .gitignore:**

   ```bash
   # Verify .env is ignored
   git status
   # .env should NOT appear in untracked files
   ```

2. **Secure file permissions:**

   ```cmd
   # Windows - Restrict access to .env
   attrib +h .env
   icacls .env /inheritance:r /grant:r "%USERNAME%":F
   ```

3. **Add validation to your app:**
   ```javascript
   // Add to src/index.js or App.js
   if (!process.env.REACT_APP_TMDB_API_KEY) {
     throw new Error("❌ TMDB API key is required");
   }
   ```

### 🚨 Emergency Response

**If you accidentally commit .env:**

1. **Immediately revoke API keys**
2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **Generate new API keys**
4. **Update all deployment environments**

### 🔗 Additional Resources

- [OWASP Environment Security](https://owasp.org/www-project-application-security-verification-standard/)
- [Git Secrets Detection](https://github.com/awslabs/git-secrets)
- [Environment Variable Best Practices](https://blog.nodejs.org/learn/security/environment-variables/)

Remember: **Security is not a one-time setup, it's an ongoing practice!** 🛡️
