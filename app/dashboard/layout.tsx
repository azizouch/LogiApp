"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { MainContent } from "@/components/main-content"
import { Toaster } from "@/components/ui/toaster"
import { LogoutModalProvider } from "@/contexts/logout-modal-context"
import { ProtectedRoute } from "@/components/protected-route"
import { RouteGuard } from "@/components/route-guard"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import Script from "next/script"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const hasAuthCookie = document.cookie.includes('auth_token=')
    const storedUser = localStorage.getItem('user')

    if (!hasAuthCookie || !storedUser) {
      // If not authenticated, redirect to login
      window.location.href = '/login'
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Skip rendering if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="beforeInteractive" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
      <style dangerouslySetInnerHTML={{ __html: `
        .small-alert-popup {
          font-size: 0.9rem;
          max-width: 300px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .small-alert-title {
          font-size: 1.1rem;
          margin-bottom: 0.3em;
        }
        .small-alert-content {
          margin-top: 0;
          padding-top: 0;
        }
        .small-alert-button {
          font-size: 0.8rem;
          padding: 0.3em 1em;
          border-radius: 4px;
        }
      `}} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LogoutModalProvider>
          <ProtectedRoute>
            <RouteGuard>
              <SidebarProvider>
                <div className="flex min-h-screen">
                  <MainContent>{children}</MainContent>
                  <ScrollToTop />
                </div>
              </SidebarProvider>
            </RouteGuard>
          </ProtectedRoute>
          <Toaster />
        </LogoutModalProvider>
      </ThemeProvider>
    </>
  )
}
