"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
  closeSidebar: () => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialize with default values, will be updated in useEffect
  const [isOpen, setIsOpen] = useState(false) // Start closed to prevent flash on mobile
  const [isMobile, setIsMobile] = useState(true) // Assume mobile first to prevent flash
  const [initialized, setInitialized] = useState(false)

  // Check if screen is mobile size on mount and when window resizes
  useEffect(() => {
    // Function to check screen size and set state accordingly
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)

      // Only auto-set the open state if not initialized yet
      if (!initialized) {
        setIsOpen(!isMobileView) // Open on desktop, closed on mobile
        setInitialized(true)
      }
    }

    // Handle window resize - close sidebar on mobile when resizing down
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)

      // Auto-close sidebar when resizing down to mobile
      if (isMobileView && isOpen) {
        setIsOpen(false)
      }

      // Auto-open sidebar when resizing up to desktop
      if (!isMobileView && !isOpen) {
        setIsOpen(true)
      }
    }

    // Check on mount
    if (typeof window !== 'undefined') {
      checkIfMobile()

      // Add resize listener
      window.addEventListener('resize', handleResize)

      // Clean up
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [initialized, isOpen])

  // Toggle sidebar with special handling for mobile
  const toggle = () => {
    console.log("Toggle sidebar called, current state:", isOpen);
    // On mobile, we want to be more explicit about opening/closing
    // This helps prevent issues with submenu toggles
    if (isMobile) {
      // If it's already open, close it
      if (isOpen) {
        console.log("Closing sidebar on mobile");
        setIsOpen(false);
      } else {
        // If it's closed, open it
        console.log("Opening sidebar on mobile");
        setIsOpen(true);
      }
    } else {
      // On desktop, just toggle as usual
      console.log("Toggling sidebar on desktop");
      setIsOpen(!isOpen);
    }
  }

  // Explicitly close the sidebar (useful for navigation links)
  const closeSidebar = () => {
    console.log("Explicitly closing sidebar");
    setIsOpen(false);
  }

  return <SidebarContext.Provider value={{ isOpen, toggle, closeSidebar, isMobile }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
