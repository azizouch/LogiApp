'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useRoleAccess } from '@/hooks/use-role-access'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { LogoutModalProvider } from "@/contexts/logout-modal-context"
import { MainContent } from "@/components/main-content"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import Script from "next/script"

export default function LivreurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { hasAccess, getUserRole } = useRoleAccess()
  const userRole = getUserRole()

  // Check if user is authenticated and has livreur role
  useEffect(() => {
    if (!loading && (!user || userRole !== 'Livreur')) {
      router.push('/')
    }
  }, [user, loading, router, userRole])

  // Show nothing while checking authentication
  if (loading || !user || userRole !== 'Livreur') {
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
          <SidebarProvider>
            <div className="flex min-h-screen bg-background">
              <MainContent>{children}</MainContent>
              <ScrollToTop />
            </div>
          </SidebarProvider>
          <Toaster />
        </LogoutModalProvider>
      </ThemeProvider>
    </>
  )
}
