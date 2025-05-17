"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  className?: string
  isMobile?: boolean
  onBeforeOpen?: () => void
}

export function LogoutButton({ className = "", isMobile = false, onBeforeOpen }: LogoutButtonProps) {
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('user')
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Redirect to login page
    window.location.href = "/login"
  }

  const openModal = () => {
    // Call the onBeforeOpen callback if provided
    if (onBeforeOpen) {
      onBeforeOpen()
    }
    
    // Open the modal
    setOpen(true)
  }

  return (
    <>
      {/* Different button styles for mobile and desktop */}
      {isMobile ? (
        // Mobile button
        <button 
          className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left ${className}`}
          type="button"
          onClick={openModal}
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      ) : (
        // Desktop button
        <div 
          className={`flex items-center w-full px-2 py-1.5 cursor-pointer ${className}`}
          onClick={openModal}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </div>
      )}

      {/* The modal is the same for both mobile and desktop */}
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
                setTimeout(handleLogout, 100)
              }}
            >
              Déconnexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
