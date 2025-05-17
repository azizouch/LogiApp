import { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { MainContent } from "@/components/main-content"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import { LogoutModalProvider } from "@/contexts/logout-modal-context"
import { ProtectedRoute } from "@/components/protected-route"
import { RouteGuard } from "@/components/route-guard"

export const metadata: Metadata = {
  title: "Système de Gestion Logistique",
  description: "Plateforme de gestion de livraison et suivi de colis",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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

        /* Custom styles for modal-like SweetAlert */
        /* Custom classes for our specific SweetAlert */
        .custom-swal-popup {
          font-family: inherit !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem !important;
          max-width: 350px !important;
        }

        .custom-swal-title {
          font-size: 0.9rem !important;
          font-weight: 600 !important;
          color: hsl(var(--foreground)) !important;
          margin: 0 0 0.4rem 0 !important;
          padding: 0 !important;
        }

        .custom-swal-content {
          font-size: 0.75rem !important;
          color: hsl(var(--muted-foreground)) !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .custom-swal-confirm {
          background-color: hsl(var(--destructive)) !important;
          color: hsl(var(--destructive-foreground)) !important;
          font-size: 0.75rem !important;
          border-radius: 0.25rem !important;
          font-weight: 500 !important;
          padding: 0.35rem 0.7rem !important;
          margin: 0 0.25rem !important;
        }

        .custom-swal-cancel {
          background-color: hsl(var(--secondary)) !important;
          color: hsl(var(--secondary-foreground)) !important;
          font-size: 0.75rem !important;
          border-radius: 0.25rem !important;
          font-weight: 500 !important;
          padding: 0.35rem 0.7rem !important;
          margin: 0 0.25rem !important;
        }

        .custom-swal-actions {
          margin: 0.75rem 0 0 0 !important;
          padding: 0 !important;
        }
      `}} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LogoutModalProvider>
          <ProtectedRoute>
            <RouteGuard>
              <SidebarProvider>
                <div className="flex min-h-screen">
                  <MainContent>{children}</MainContent>
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
