"use client"

import { LogOut } from "lucide-react"
import { showToast } from "@/components/ui/custom-toast"

interface DirectLogoutButtonProps {
  onClose?: () => void
}

export function DirectLogoutButton({ onClose }: DirectLogoutButtonProps) {
  const handleLogout = () => {
    // First close the mobile menu if provided
    if (onClose) {
      onClose()
    }
    
    // Then perform a direct logout
    try {
      // Clear user state from localStorage
      localStorage.removeItem('user')
      
      // Clear auth cookie
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      
      // Show success message
      showToast({
        message: "Vous avez été déconnecté avec succès.",
        type: "success"
      })
      
      // Force redirect to login page
      window.location.href = "/login"
    } catch (error) {
      console.error("Error during logout:", error)
      
      showToast({
        message: "Une erreur est survenue lors de la déconnexion.",
        type: "error"
      })
    }
  }
  
  return (
    <button 
      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
      type="button"
      onClick={handleLogout}
    >
      <LogOut className="h-5 w-5" />
      <span>Déconnexion</span>
    </button>
  )
}
