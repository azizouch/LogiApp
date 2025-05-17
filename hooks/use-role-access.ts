"use client"

import React from "react"
import { useAuth, type UserRole } from "@/contexts/auth-context"

export function useRoleAccess() {
  const { user } = useAuth()

  // Normalize a role string to ensure consistent casing
  const normalizeRole = React.useCallback((roleStr: string): UserRole => {
    return (roleStr.charAt(0).toUpperCase() +
            roleStr.slice(1).toLowerCase()) as UserRole
  }, [])

  // Check if user has access to a specific set of roles
  const hasAccess = React.useCallback((requiredRoles: UserRole[]) => {
    if (!user || !user.role) return false

    // Normalize the role to handle case sensitivity issues
    const normalizedRole = normalizeRole(user.role as string)

    return requiredRoles.includes(normalizedRole)
  }, [user, normalizeRole])

  // Get the normalized user role
  const getUserRole = React.useCallback((): UserRole | null => {
    if (!user || !user.role) return null

    // Normalize the role to handle case sensitivity issues
    return normalizeRole(user.role as string)
  }, [user, normalizeRole])

  return { hasAccess, getUserRole, normalizeRole }
}
