"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScrollToTopProps {
  /**
   * The threshold in pixels after which the button appears
   * @default 300
   */
  threshold?: number
  
  /**
   * The position of the button
   * @default "bottom-4 right-4"
   */
  position?: string
  
  /**
   * Additional class names for the button
   */
  className?: string
  
  /**
   * The size of the button
   * @default "default"
   */
  size?: "sm" | "default" | "lg" | "icon"
  
  /**
   * The variant of the button
   * @default "secondary"
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ScrollToTop({
  threshold = 300,
  position = "bottom-4 right-4",
  className,
  size = "icon",
  variant = "secondary"
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Initial check
    toggleVisibility()
    
    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility)
    
    // Clean up
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [threshold])

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <Button
      onClick={scrollToTop}
      className={cn(
        "fixed z-50 shadow-md transition-opacity duration-300",
        position,
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      size={size}
      variant={variant}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  )
}
