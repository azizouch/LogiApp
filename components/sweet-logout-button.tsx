"use client"

import { LogOut } from "lucide-react"
import Swal from 'sweetalert2'

interface SweetLogoutButtonProps {
  isMobile?: boolean
  onBeforeLogout?: () => void
}

export function SweetLogoutButton({ isMobile = false, onBeforeLogout }: SweetLogoutButtonProps) {
  const handleLogoutClick = () => {
    // Call onBeforeLogout if provided
    if (onBeforeLogout) {
      onBeforeLogout();
    }
    
    // Use SweetAlert2 for confirmation
    Swal.fire({
      title: 'Confirmation de déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter de l\'application?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Déconnexion',
      cancelButtonText: 'Annuler',
      customClass: {
        container: 'swal-container',
        popup: 'swal-popup',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear user data
        localStorage.removeItem('user');
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        // Show success message
        Swal.fire({
          title: 'Déconnecté!',
          text: 'Vous avez été déconnecté avec succès.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          // Redirect to login page
          window.location.href = "/login";
        });
      }
    });
  };

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
    );
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
  );
}
