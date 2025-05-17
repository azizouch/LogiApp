"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { useRoleAccess } from "@/hooks/use-role-access"
import { showToast } from "@/components/ui/custom-toast"

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
}

export function RouteGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth()
  const { hasAccess } = useRoleAccess()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip for login page
    if (pathname === "/login") return

    // If no user, we'll let the ProtectedRoute component handle the redirect
    if (!user) return

    // Get required roles for the current route
    const requiredRoles = routeAccess[pathname]

    // If route is not in the access list, allow access (public route)
    if (!requiredRoles) return

    // If user's role is not in the required roles, redirect to dashboard
    if (!hasAccess(requiredRoles)) {
      showToast({
        message: "Vous n'avez pas accès à cette page",
        type: "error"
      })
      window.location.href = "/"
    }
  }, [pathname, user, router, hasAccess])

  return <>{children}</>
}
