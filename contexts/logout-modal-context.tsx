"use client"

import React, { createContext, useContext, useState } from "react"
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

// Define the context type
type LogoutModalContextType = {
  openLogoutModal: () => void
}

// Create the context with a default value
const LogoutModalContext = createContext<LogoutModalContextType>({
  openLogoutModal: () => {}
})

// Hook to use the logout modal context
export const useLogoutModal = () => useContext(LogoutModalContext)

// Provider component
export function LogoutModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openLogoutModal = () => {
    setIsOpen(true)
  }

  const handleLogout = () => {
    // Close the modal
    setIsOpen(false)
    
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
    <LogoutModalContext.Provider value={{ openLogoutModal }}>
      {children}
      
      {/* Global logout modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Confirmation de déconnexion</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter de l'application?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
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
    </LogoutModalContext.Provider>
  )
}
