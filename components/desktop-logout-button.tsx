"use client"

import { useState } from "react"
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

export function DesktopLogoutButton() {
  const [open, setOpen] = useState(false)

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

  return (
    <>
      <div 
        className="flex items-center w-full px-2 py-1.5 cursor-pointer"
        onClick={(e) => {
          // Stop event propagation to prevent the dropdown from closing
          e.stopPropagation()
          // Open the modal
          setOpen(true)
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Déconnexion</span>
      </div>
      
      <Dialog 
        open={open} 
        onOpenChange={(newOpen) => {
          // Only allow the Dialog to be closed via the buttons
          if (!newOpen) {
            setOpen(false)
          }
        }}
      >
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
    </>
  )
}
