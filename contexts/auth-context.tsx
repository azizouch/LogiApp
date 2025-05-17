"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { showToast } from "@/components/ui/custom-toast"

// Define user roles
export type UserRole = "Admin" | "Gestionnaire" | "Livreur"

// Define user type
export type User = {
  id: string
  email: string
  nom: string
  prenom: string
  role: UserRole
  statut: "Actif" | "Inactif"
}

// Define auth context type
type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasAccess: (requiredRoles: UserRole[]) => boolean
  normalizeRole: (roleStr: string) => UserRole
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Normalize a role string to ensure consistent casing
  const normalizeRole = useCallback((roleStr: string): UserRole => {
    return (roleStr.charAt(0).toUpperCase() +
            roleStr.slice(1).toLowerCase()) as UserRole
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Keep loading state true until we've completed the check
        setLoading(true)

        // Check if we have an auth token in cookies
        const hasAuthCookie = document.cookie.includes('auth_token=')

        if (hasAuthCookie) {
          // Get user data from localStorage if available
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)

            // Ensure role is properly typed and normalized
            if (parsedUser && parsedUser.role) {
              // Normalize the role to handle case sensitivity issues
              let normalizedRole: UserRole

              if (typeof parsedUser.role === 'string') {
                normalizedRole = normalizeRole(parsedUser.role)
              } else {
                // Default to Livreur if role is not a string (shouldn't happen)
                normalizedRole = "Livreur"
              }

              // Update the user object with the normalized role
              parsedUser.role = normalizedRole
            }

            setUser(parsedUser)

            // If we're on the login page, redirect to dashboard
            if (window.location.pathname === '/login') {
              window.location.href = '/dashboard'
            }
          } else {
            // If no stored user but we have a token, clear the token
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            window.location.href = '/login'
          }
        } else {
          // No auth cookie, ensure user is null
          setUser(null)

          // If not on login page, redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
        // On error, clear user state to be safe
        setUser(null)
      } finally {
        // Only set loading to false after a short delay to ensure redirects happen first
        setTimeout(() => {
          setLoading(false)
        }, 300)
      }
    }

    checkSession()
  }, [router, normalizeRole])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Query the utilisateurs table to find a matching user
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('email', email)
        .eq('mot_de_passe', password) // In a real app, you'd use proper password hashing
        .eq('statut', 'Actif') // Only active users can login
        .single()

      if (error || !data) {
        // Show error toast
        showToast({
          message: "Identifiants incorrects ou compte inactif",
          type: "error"
        })

        return {
          success: false,
          error: "Identifiants incorrects ou compte inactif"
        }
      }

      // Create user object
      // Normalize the role to handle case sensitivity issues
      let normalizedRole: UserRole

      if (typeof data.role === 'string') {
        normalizedRole = normalizeRole(data.role)
      } else {
        // Default to Livreur if role is not a string (shouldn't happen)
        normalizedRole = "Livreur"
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        role: normalizedRole,
        statut: data.statut
      }

      // Store user in state and localStorage
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Set auth cookie
      document.cookie = "auth_token=dummy_token; path=/; max-age=86400"

      // Show success toast
      showToast({
        message: `Bienvenue, ${userData.prenom} ${userData.nom}!`,
        type: "success"
      })

      // Keep loading state true to prevent flashing of login page
      // The loading state will be set to false after the redirect completes
      setLoading(true)

      return {
        success: true,
        userData: userData
      }
    } catch (error) {
      console.error("Login error:", error)

      // Show error toast
      showToast({
        message: "Une erreur est survenue lors de la connexion",
        type: "error"
      })

      return {
        success: false,
        error: "Une erreur est survenue lors de la connexion"
      }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    try {
      // Clear user state
      setUser(null)

      // Clear localStorage
      localStorage.removeItem('user')

      // Clear auth cookie
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Show success message with custom toast
      showToast({
        message: "Vous avez été déconnecté avec succès.",
        type: "success"
      })

      // Redirect to login - use window.location for a hard navigation
      window.location.href = '/login'
    } catch (error) {
      console.error("Error during logout:", error)

      // Show error message
      showToast({
        message: "Une erreur est survenue lors de la déconnexion.",
        type: "error"
      })
    }
  }

  // Function already defined above

  // Function to check if user has access based on role
  const hasAccess = useCallback((requiredRoles: UserRole[]) => {
    if (!user || !user.role) return false

    // Normalize the role to handle case sensitivity issues
    const normalizedRole = normalizeRole(user.role as string)

    return requiredRoles.includes(normalizedRole)
  }, [user, normalizeRole])

  // Context value wrapped in useMemo to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    hasAccess,
    normalizeRole
  }), [user, loading, login, logout, hasAccess, normalizeRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
