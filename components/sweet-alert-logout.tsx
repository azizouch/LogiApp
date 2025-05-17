"use client"

import { LogOut } from "lucide-react"

// Define the props interface
interface SweetAlertLogoutProps {
  isMobile?: boolean
  onBeforeLogout?: () => void
}

export function SweetAlertLogout({ isMobile = false, onBeforeLogout }: SweetAlertLogoutProps) {
  const handleLogoutClick = () => {
    // Call onBeforeLogout if provided (to close menus)
    if (onBeforeLogout) {
      onBeforeLogout()
    }
    
    // Use SweetAlert2 directly from the window object
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        title: 'Confirmation de déconnexion',
        text: 'Êtes-vous sûr de vouloir vous déconnecter de l\'application?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Déconnexion',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear user data
          localStorage.removeItem('user')
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          
          // Show success message
          window.Swal.fire({
            title: 'Déconnecté!',
            text: 'Vous avez été déconnecté avec succès.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            // Redirect to login page
            window.location.href = "/login"
          })
        }
      })
    } else {
      // Fallback if SweetAlert is not available
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter de l\'application?')) {
        localStorage.removeItem('user')
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        window.location.href = "/login"
      }
    }
  }

  // Different styles for mobile and desktop
  if (isMobile) {
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
  
  // Desktop version
  return (
    <div 
      className="flex items-center w-full px-2 py-1.5 cursor-pointer"
      onClick={handleLogoutClick}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Déconnexion</span>
    </div>
  )
}
