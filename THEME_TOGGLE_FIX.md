# Theme Toggle Hydration Fix

This document explains the fix for the hydration error related to the theme toggle component.

## The Problem

The theme toggle component was causing a hydration error with the following message:

```
Unhandled Runtime Error

Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

onClick={function onClick}
+                             title="Mode clair"
-                             title="Mode sombre"
```

This error occurred because:

1. During server-side rendering (SSR), the theme value is not available, so the component renders with a default state
2. When the client-side JavaScript runs, it detects the actual theme and renders different content
3. React detects this mismatch between server and client rendering and throws a hydration error

## The Solution

The solution is to defer rendering theme-specific content until after the component has mounted on the client side:

```jsx
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), [])
  
  if (!mounted) {
    // Return a placeholder with the same dimensions during SSR
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
      >
        <Moon className="h-5 w-5" />
      </Button>
    )
  }
  
  const isCurrentlyDark = theme === "dark"
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isCurrentlyDark ? "light" : "dark")}
      title={isCurrentlyDark ? "Mode clair" : "Mode sombre"}
    >
      {isCurrentlyDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
```

## How This Fix Works

1. We add a `mounted` state that starts as `false`
2. We use `useEffect` to set `mounted` to `true` after the component mounts on the client
3. If the component is not yet mounted (during SSR), we render a placeholder button with the same dimensions
4. Once mounted, we render the actual theme toggle button with the correct theme-specific content

This approach ensures that:

1. The server always renders the same placeholder content
2. The client replaces this placeholder with the actual content after mounting
3. There's no mismatch between server and client rendering

## Best Practices for Theme-Related Components

When working with theme-related components:

1. Always defer theme-specific rendering until after component mounting
2. Use a consistent placeholder during SSR
3. Store theme values in variables to avoid repetition
4. Consider using the `suppressHydrationWarning` prop for minor mismatches

## Testing the Fix

To verify that the hydration issue is fixed:

1. Restart your development server
2. Open the application in your browser
3. Check the browser console for any hydration warnings or errors
4. Toggle the theme multiple times to ensure it works correctly
5. Refresh the page and verify that no hydration errors occur
