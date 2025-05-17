"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { useRoleAccess } from "@/hooks/use-role-access"
import { AuthLoading } from "@/components/auth-loading"

// Define route access configuration
export const routeAccess: Record<string, UserRole[]> = {
  "/": ["Admin", "Gestionnaire", "Livreur"], // Root URL is the dashboard
  "/colis": ["Admin", "Gestionnaire"],
  "/liste-colis": ["Admin", "Gestionnaire"],
  "/mes-colis": ["Livreur"], // Only livreur can access their colis
  "/colis/livres": ["Admin", "Gestionnaire", "Livreur"],
  "/colis/refuses": ["Admin", "Gestionnaire", "Livreur"],
  "/colis/annules": ["Admin", "Gestionnaire", "Livreur"],
  "/colis/relance": ["Livreur"],
  "/colis/relance-autre": ["Livreur"],
  "/bons": ["Admin", "Gestionnaire", "Livreur"],
  "/bons-paiement": ["Admin", "Gestionnaire"],
  "/bons-retour": ["Admin", "Gestionnaire"],
  "/clients": ["Admin", "Gestionnaire"],
  "/entreprises": ["Admin", "Gestionnaire"],
  "/livreurs": ["Admin", "Gestionnaire"],
  "/utilisateur": ["Admin"],
  "/track-users": ["Admin"],
  "/parametres": ["Admin"],
  "/db-management": ["Admin"],
  // Add more routes as needed
}

// For livreur role, we need to customize the dashboard to show only their data
export const customizeLivreurRoutes = ["/", "/bons", "/mes-colis", "/colis/livres", "/colis/refuses", "/colis/annules", "/colis/relance", "/colis/relance-autre"]

export function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth()
  const { hasAccess } = useRoleAccess()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip during initial loading
    if (loading) return

    // Special case for login page - don't apply protection
    if (pathname === "/login") return

    // If no user is logged in and not on login page, redirect to login
    if (!user) {
      window.location.href = "/login"
      return
    }

    // If user is logged in, check route access
    // Get required roles for the current route
    const requiredRoles = routeAccess[pathname]

    // If route is not in the access list, allow access (public route)
    if (!requiredRoles) return

    // If user's role is not in the required roles, redirect to dashboard
    if (!hasAccess(requiredRoles)) {
      window.location.href = "/"
    }
  }, [user, loading, pathname, router, hasAccess])

  // Show loading screen during initial loading or redirects
  // But don't show loading screen on login page
  if (pathname !== "/login" && (loading || !user)) {
    return <AuthLoading />
  }

  return <>{children}</>
}
