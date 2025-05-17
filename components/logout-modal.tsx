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

interface LogoutModalProps {
  trigger?: React.ReactNode
  onConfirm?: () => void // Keep for backward compatibility
}

export function LogoutModal({ trigger, onConfirm }: LogoutModalProps) {
  const [open, setOpen] = useState(false)

  // Simple function to handle logout
  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('user')
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Redirect to login page
    window.location.href = "/login"
  }

  return (
    <>
      {/* Trigger button */}
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-start"
          onClick={() => setOpen(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
      )}

      {/* Modal dialog */}
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
