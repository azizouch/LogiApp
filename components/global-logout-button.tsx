"use client"

import { LogOut } from "lucide-react"
import { useLogoutModal } from "@/contexts/logout-modal-context"

interface GlobalLogoutButtonProps {
  isMobile?: boolean
  onBeforeLogout?: () => void
}

export function GlobalLogoutButton({ isMobile = false, onBeforeLogout }: GlobalLogoutButtonProps) {
  const { openLogoutModal } = useLogoutModal()

  const handleClick = () => {
    // Call onBeforeLogout if provided
    if (onBeforeLogout) {
      onBeforeLogout()
    }
    
    // Open the global logout modal
    openLogoutModal()
  }

  // Different styles for mobile and desktop
  if (isMobile) {
    return (
      <button 
        className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
        type="button"
        onClick={handleClick}
      >
        <LogOut className="h-5 w-5" />
        <span>Déconnexion</span>
      </button>
    )
  }
  
  // Desktop version
  return (
    <div 
      className="flex items-center w-full px-2 py-1.5 cursor-pointer"
      onClick={handleClick}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Déconnexion</span>
    </div>
  )
}
