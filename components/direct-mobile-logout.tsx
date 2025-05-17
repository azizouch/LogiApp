"use client"

import { LogOut } from "lucide-react"
import { showToast } from "@/components/ui/custom-toast"

interface DirectMobileLogoutProps {
  onBeforeLogout?: () => void
}

export function DirectMobileLogout({ onBeforeLogout }: DirectMobileLogoutProps) {
  const handleLogoutClick = () => {
    // Call onBeforeLogout if provided
    if (onBeforeLogout) {
      onBeforeLogout()
    }
    
    // Use native confirm dialog which works reliably on all devices
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter de l'application?")) {
      // Clear user data
      localStorage.removeItem('user')
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      
      // Show success message
      showToast({
        message: "Vous avez été déconnecté avec succès.",
        type: "success"
      })
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/login"
      }, 300)
    }
  }

  return (
    <button 
      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
      type="button"
      onClick={handleLogoutClick}
    >
      <LogOut className="h-5 w-5" />
      <span>Déconnexion</span>
    </button>
  )
}
