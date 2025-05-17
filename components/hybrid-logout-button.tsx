"use client"

import { useState, useEffect } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { showToast } from "@/components/ui/custom-toast"

interface HybridLogoutButtonProps {
  isMobile?: boolean
  onBeforeLogout?: () => void
  closeDropdown?: () => void
}

export function HybridLogoutButton({ isMobile = false, onBeforeLogout, closeDropdown }: HybridLogoutButtonProps) {
  const [open, setOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

  // Detect mobile screen on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    // Check initially
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
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

  const handleClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent the dropdown from closing immediately
    e.stopPropagation()

    // Call onBeforeLogout if provided
    if (onBeforeLogout) {
      onBeforeLogout()
    }

    // We'll handle dropdown closing after the modal is shown
    // Don't close it immediately

    // Use different approaches based on screen size
    if (isMobileView) {
      // Use SweetAlert for mobile with modal-like styling
      if (typeof window !== 'undefined' && window.Swal) {
        // Close dropdown after a short delay if needed
        if (closeDropdown) {
          setTimeout(() => {
            closeDropdown();
          }, 100);
        }

        window.Swal.fire({
          title: 'Confirmation',
          html: 'Êtes-vous sûr de vouloir vous déconnecter?',
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: 'Déconnexion',
          cancelButtonText: 'Annuler',
          buttonsStyling: true,
          showClass: {
            popup: 'animate__animated animate__fadeIn animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOut animate__faster'
          },
          // Remove the icon
          icon: undefined,
          // Style to match the modal but more compact
          width: 'calc(100% - 2rem)',
          background: 'hsl(var(--background))',
          // Use our custom classes
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            htmlContainer: 'custom-swal-content',
            confirmButton: 'custom-swal-confirm',
            cancelButton: 'custom-swal-cancel',
            actions: 'custom-swal-actions'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            handleLogout()
          }
        })
      } else {
        // Fallback to confirm
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
          handleLogout()
        }
      }
    } else {
      // Use modal for desktop
      // Close dropdown after a short delay if needed
      if (closeDropdown) {
        setTimeout(() => {
          closeDropdown();
        }, 100);
      }

      // Open the modal
      setOpen(true)
    }
  }

  // Different styles for mobile and desktop
  if (isMobile) {
    return (
      <>
        <button
          className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
          type="button"
          onClick={(e) => handleClick(e)}
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>

        {/* Modal for desktop only */}
        {!isMobileView && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] mx-auto">
              <DialogHeader>
                <DialogTitle>Confirmation de déconnexion</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir vous déconnecter de l'application?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                >
                  Déconnexion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }

  // Desktop version
  return (
    <>
      <div
        className="flex items-center w-full px-2 py-1.5 cursor-pointer"
        onClick={(e) => handleClick(e)}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Déconnexion</span>
      </div>

      {/* Modal for desktop only */}
      {!isMobileView && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Confirmation de déconnexion</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir vous déconnecter de l'application?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setOpen(false)
                  handleLogout()
                }}
              >
                Déconnexion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
