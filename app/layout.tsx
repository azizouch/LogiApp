import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./styles/status-colors.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { StatusProvider } from "@/contexts/status-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { ProtectedRoute } from "@/components/protected-route"
import { RouteGuard } from "@/components/route-guard"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LogiTrack",
  description: "Plateforme de gestion de livraison et suivi de colis",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* SweetAlert2 CDN */}
        <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="beforeInteractive" />
        {/* Animate.css for animations */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
        {/* Custom styles for small alerts */}
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
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <StatusProvider>
              <NotificationProvider>
                {children}
                <Toaster />
              </NotificationProvider>
            </StatusProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
