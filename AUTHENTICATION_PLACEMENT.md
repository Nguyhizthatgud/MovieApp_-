# Authentication Feature Placement Guide

## 🔐 Authentication Feature Structure

Here's exactly where to place all authentication-related code in your MovieApp:

```
src/features/authentication/
├── components/                  📦 Auth UI Components
│   ├── LoginForm.tsx           🔑 Login form component
│   ├── SignupForm.tsx          📝 Registration form
│   ├── ForgotPassword.tsx      🔄 Password reset
│   ├── AuthModal.tsx           📱 Modal wrapper for auth forms
│   ├── ProtectedRoute.tsx      🛡️ Route protection component
│   └── LogoutButton.tsx        🚪 Logout functionality
├── hooks/                      🎣 Auth Business Logic
│   ├── useAuth.ts              👤 Main auth hook
│   ├── useLogin.ts             🔑 Login logic
│   ├── useSignup.ts            📝 Registration logic
│   ├── useLogout.ts            🚪 Logout logic
│   └── useAuthGuard.ts         🛡️ Route protection logic
├── services/                   🔌 Auth API & External Services
│   ├── authApi.ts              🌐 Authentication API calls
│   ├── tokenService.ts         🎫 JWT token management
│   └── authStorage.ts          💾 Local storage helpers
├── context/                    🌍 Global Auth State
│   ├── AuthContext.tsx         📡 React context for auth
│   └── AuthProvider.tsx        🏪 Context provider component
├── types/                      📝 Auth Type Definitions
│   ├── auth.types.ts           👤 User and auth types
│   └── api.types.ts            🔗 API request/response types
├── utils/                      🛠️ Auth Utilities
│   ├── validators.ts           ✅ Form validation
│   ├── authHelpers.ts          🔧 Helper functions
│   └── constants.ts            📋 Auth constants
└── index.ts                    🚪 Public API exports
```

## 📁 File Placement Examples

### 1. Auth Components

```typescript
// ✅ CORRECT: Feature-based placement
src / features / authentication / components / LoginForm.tsx;
src / features / authentication / components / SignupForm.tsx;
src / features / authentication / components / ProtectedRoute.tsx;

// ❌ WRONG: Type-based placement
src / components / LoginForm.tsx;
src / components / SignupForm.tsx;
src / components / ProtectedRoute.tsx;
```

### 2. Auth Hooks

```typescript
// ✅ CORRECT: Feature-based placement
src / features / authentication / hooks / useAuth.ts;
src / features / authentication / hooks / useLogin.ts;
src / features / authentication / hooks / useAuthGuard.ts;

// ❌ WRONG: Type-based placement
src / hooks / useAuth.ts;
src / hooks / useLogin.ts;
src / hooks / useAuthGuard.ts;
```

### 3. Auth Services

```typescript
// ✅ CORRECT: Feature-based placement
src / features / authentication / services / authApi.ts;
src / features / authentication / services / tokenService.ts;

// ❌ WRONG: Type-based placement
src / services / authApi.ts;
src / services / tokenService.ts;
```

## 🔗 Integration with Other Features

### How Auth Connects to Movies Feature

```typescript
// Movies feature can import auth functionality
// src/features/movies/components/MoviePage.tsx
import { useAuth, ProtectedRoute } from "@/features/authentication";

const MoviePage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome {user?.name}</h1>
        <MovieList />
      </div>
    </ProtectedRoute>
  );
};
```

### App-Level Integration

```typescript
// src/App.tsx
import { AuthProvider } from "@/features/authentication";
import { MovieApp } from "@/features/movies";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/movies" element={<MovieApp />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

## 🎯 Where NOT to Place Auth Code

### ❌ Avoid These Locations:

```
src/components/auth/           ❌ Type-based grouping
src/auth/                      ❌ Too generic, not following convention
src/utils/auth.js             ❌ Mixed with general utilities
src/services/auth/            ❌ Type-based, away from feature
src/contexts/AuthContext.js   ❌ Separated from feature logic
```

## 🏗️ Cross-Feature Dependencies

### Shared Auth Logic

Some auth functionality might be needed across features:

```typescript
// Keep truly shared utilities in shared folder
src/shared/hooks/
├── useLocalStorage.ts        🔧 Generic storage hook
└── useApiClient.ts          🌐 Generic API client

// Feature-specific auth logic stays in auth feature
src/features/authentication/hooks/
├── useAuth.ts               👤 Auth-specific logic
├── useAuthToken.ts          🎫 Token management
└── useAuthValidation.ts     ✅ Auth validation
```

## 📊 Benefits of This Structure

### 1. **Clear Ownership**

```
👥 Auth Team owns: src/features/authentication/
🎬 Movies Team owns: src/features/movies/
📊 Analytics Team owns: src/features/analytics/
```

### 2. **Easy Discovery**

```
🔍 "Where is the login form?"
→ src/features/authentication/components/LoginForm.tsx

🔍 "Where is auth API logic?"
→ src/features/authentication/services/authApi.ts
```

### 3. **Simple Refactoring**

```bash
# Remove entire auth feature
rm -rf src/features/authentication/

# Or move to separate package
mv src/features/authentication/ packages/auth-package/
```

### 4. **Clean Imports**

```typescript
// Clean, semantic imports
import { LoginForm, useAuth, ProtectedRoute } from "@/features/authentication";

// Instead of scattered imports
import LoginForm from "../../../components/auth/LoginForm";
import { useAuth } from "../../../hooks/useAuth";
import ProtectedRoute from "../../../components/ProtectedRoute";
```

This structure keeps all authentication logic organized in one place while making it easy to integrate with other features!
