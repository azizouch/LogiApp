"use client"

import { LogOut } from "lucide-react"
import { LogoutModal } from "@/components/logout-modal"
import { useAuth } from "@/contexts/auth-context"

interface MobileLogoutButtonProps {
  onClose?: () => void
}

export function MobileLogoutButton({ onClose }: MobileLogoutButtonProps) {
  const { logout } = useAuth()

  // Combine the logout function with closing the menu
  const handleLogout = () => {
    if (onClose) {
      onClose()
    }
    logout()
  }

  return (
    <LogoutModal
      onConfirm={handleLogout}
      trigger={
        <button
          className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
          type="button"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      }
    />
  )
}
