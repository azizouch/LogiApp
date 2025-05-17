"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

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
