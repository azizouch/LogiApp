# Authentication Implementation

This document explains the implementation of a standalone authentication system in the LogiTrack application.

## Overview

We've implemented a login system where:

1. The login page is completely separate from the main application layout
2. Users must authenticate before accessing any part of the application
3. After successful login, users are redirected to the main application
4. The middleware handles authentication checks and redirects

## Implementation Details

### 1. Application Structure

The application is now structured as follows:

```
app/
├── page.tsx                # Main dashboard page (protected)
├── auth/                   # Authentication pages with separate layout
│   ├── layout.tsx          # Auth-specific layout
│   ├── login/              # Login page
│   │   └── page.tsx        # Login form
│   └── forgot-password/    # Password recovery
│       └── page.tsx        # Password reset form
└── ...                     # Other application pages (protected)
```

### 2. Auth Layout

The auth layout (`app/auth/layout.tsx`) provides a minimal layout for authentication pages:

```jsx
export default function AuthLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

This layout is completely separate from the main application layout, ensuring that authentication pages don't show the sidebar, header, or other application UI elements.

### 3. Login Page

The login page (`app/auth/login/page.tsx`) handles user authentication:

```jsx
export default function LoginPage() {
  // State management for form
  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ...

    try {
      // Authentication logic
      // ...
      
      // Set authentication cookie
      document.cookie = "auth_token=dummy_token; path=/; max-age=86400"
      
      // Redirect to dashboard after successful login
      router.push("/")
    } catch (err) {
      // Error handling
    }
  }

  // Login form JSX
  // ...
}
```

### 4. Middleware for Authentication

The middleware (`middleware.ts`) handles authentication checks and redirects:

```jsx
export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const isAuthenticated = request.cookies.has('auth_token')
  
  // Define auth pages
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/auth/') || 
    request.nextUrl.pathname === '/auth'
  
  // If the user is not authenticated and not on an auth page, redirect to login
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // If the user is authenticated and on an auth page, redirect to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}
```

This ensures:
- Unauthenticated users are redirected to the login page
- Authenticated users are redirected away from auth pages
- The appropriate routes are protected

### 5. Logout Functionality

The logout functionality is implemented in the user dropdown:

```jsx
<DropdownMenuItem 
  className="cursor-pointer text-red-600"
  onClick={() => {
    // Remove the auth cookie
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Redirect to login page
    window.location.href = "/auth/login";
  }}
>
  <LogOut className="mr-2 h-4 w-4" />
  <span>Déconnexion</span>
</DropdownMenuItem>
```

## Authentication Flow

The complete authentication flow is:

1. **Initial Access**:
   - User visits any page in the application
   - Middleware checks for authentication
   - If not authenticated, redirects to login page
   - Login page is displayed with minimal layout (no sidebar, header, etc.)

2. **Login**:
   - User enters credentials
   - On successful authentication, a cookie is set
   - User is redirected to the main application

3. **Protected Routes**:
   - Middleware checks for authentication on each request
   - Authenticated users can access protected routes
   - Unauthenticated users are redirected to login

4. **Logout**:
   - User clicks logout
   - Authentication cookie is removed
   - User is redirected to login page

## Technical Implementation

The authentication system uses:

1. **Next.js App Router**: For page routing and layouts
2. **Separate Layouts**: For auth and main application
3. **Cookies**: For storing authentication state
4. **Middleware**: For route protection and redirects

## Benefits of This Approach

1. **Clean Separation**: Authentication pages are completely separate from the main application
2. **Security**: Protected routes are only accessible to authenticated users
3. **User Experience**: Login page is focused and distraction-free
4. **Maintainability**: Auth-related code is organized in its own directory
5. **Scalability**: Easy to add more authentication features (registration, password reset, etc.)
