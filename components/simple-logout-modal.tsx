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

export function SimpleLogoutModal() {
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('user')
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Redirect to login page
    window.location.href = "/login"
  }

  return (
    <>
      <button 
        className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
        type="button"
        onClick={() => setOpen(true)}
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
