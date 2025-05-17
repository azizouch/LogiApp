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
import { showToast } from "@/components/ui/custom-toast"

interface MobileLogoutDialogProps {
  onBeforeLogout?: () => void
}

export function MobileLogoutDialog({ onBeforeLogout }: MobileLogoutDialogProps) {
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    // Close the dialog
    setOpen(false)
    
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
    }, 500)
  }

  return (
    <>
      <button
        className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          
          // Call onBeforeLogout if provided
          if (onBeforeLogout) {
            onBeforeLogout()
          }
          
          // Open the dialog
          console.log("Opening mobile logout dialog")
          setOpen(true)
        }}
      >
        <LogOut className="h-5 w-5" />
        <span>Déconnexion</span>
      </button>

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
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
