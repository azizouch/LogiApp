# Fixing React Hydration Issues

This document explains the changes made to fix the hydration issues in the LogiApp application.

## What is a Hydration Error?

A hydration error occurs when the HTML generated on the server doesn't match what React tries to render on the client. This can happen due to:

1. Using browser-only APIs during server rendering (like `window` or `document`)
2. Using dynamic values that change between server and client (like `Date.now()` or `Math.random()`)
3. Date formatting in different locales
4. Invalid HTML nesting

## Changes Made to Fix Hydration Issues

### 1. Fixed Date Formatting in Dashboard

The dashboard was using `new Date().toLocaleDateString()` directly in the render function, which causes different output between server and client:

```jsx
// Before
<div className="text-sm text-muted-foreground">
  {new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
</div>

// After
const [formattedDate, setFormattedDate] = useState<string>("");

useEffect(() => {
  // Format date on client side only
  setFormattedDate(
    new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
}, []);

<div className="text-sm text-muted-foreground">
  {formattedDate}
</div>
```

### 2. Fixed Date Formatting in Colis Page

Added a null check for date formatting to prevent errors:

```jsx
// Before
{new Date(item.dateCreation).toLocaleDateString("fr-FR")}

// After
{item.dateCreation ? new Date(item.dateCreation).toLocaleDateString("fr-FR") : ""}
```

### 3. Fixed useIsMobile Hook

The `useIsMobile` hook was using browser-only APIs during server rendering:

```jsx
// Before
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// After
export function useIsMobile() {
  // Default to false for SSR
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  // Track if component is mounted
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // Only run on client-side
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }

      // Set initial value
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

      // Add event listener
      mql.addEventListener("change", onChange)

      // Cleanup
      return () => mql.removeEventListener("change", onChange)
    }
  }, [])

  // Return false during SSR, actual value after mount
  return mounted ? isMobile : false
}
```

### 4. Fixed Random Width Generation in SidebarMenuSkeleton

The `SidebarMenuSkeleton` component was using `Math.random()` during rendering:

```jsx
// Before
const width = React.useMemo(() => {
  return `${Math.floor(Math.random() * 40) + 50}%`
}, [])

// After
// Use a fixed width for SSR compatibility
const [width, setWidth] = React.useState("70%");

// Generate random width only on client-side after mount
React.useEffect(() => {
  // Random width between 50 to 90%
  setWidth(`${Math.floor(Math.random() * 40) + 50}%`);
}, []);
```

### 5. Added suppressHydrationWarning to RootLayout

Added `suppressHydrationWarning` to the body element to prevent warnings for minor mismatches:

```jsx
// Before
<body className={inter.className}>

// After
<body className={inter.className} suppressHydrationWarning>
```

### 6. Fixed Theme Toggle Component

The theme toggle component was causing hydration errors because it used theme values directly in the render function:

```jsx
// Before
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

// After
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

## Best Practices to Avoid Hydration Issues

1. **Avoid Browser-Only APIs in Render**: Don't use `window`, `document`, or other browser-only APIs during rendering. Use them in `useEffect` hooks instead.

2. **Handle Date Formatting Carefully**: Format dates on the client side using `useEffect` or ensure consistent formatting between server and client.

3. **Avoid Random Values During Render**: Don't use `Math.random()` or other non-deterministic functions during rendering. Generate random values in `useEffect` hooks instead.

4. **Check for Null/Undefined Values**: Always check if values exist before using them, especially when formatting dates or accessing nested properties.

5. **Use Client Components When Needed**: Mark components that use browser APIs with `"use client"` directive.

6. **Use suppressHydrationWarning**: For elements that intentionally differ between server and client, use the `suppressHydrationWarning` prop.

7. **Defer Theme Rendering**: For theme-related components, wait until the component is mounted before rendering theme-specific content.

## Further Reading

- [React Hydration Documentation](https://react.dev/reference/react-dom/hydrate)
- [Next.js Hydration Error Documentation](https://nextjs.org/docs/messages/react-hydration-error)
