"use client"

import { LogOut } from "lucide-react"
import { showToast } from "@/components/ui/custom-toast"
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

interface ToastLogoutButtonProps {
  isMobile?: boolean
  onBeforeLogout?: () => void
}

export function ToastLogoutButton({ isMobile = false, onBeforeLogout }: ToastLogoutButtonProps) {
  const [open, setOpen] = useState(false)

  const handleLogoutClick = () => {
    // Call onBeforeLogout if provided
    if (onBeforeLogout) {
      onBeforeLogout();
    }

    // Open the confirmation dialog
    setOpen(true);
  };

  const handleConfirmLogout = () => {
    // Close the dialog
    setOpen(false);

    // Clear user data
    localStorage.removeItem('user');
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Show success message
    showToast({
      message: "Vous avez été déconnecté avec succès.",
      type: "success"
    });

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  // Shared dialog component for both mobile and desktop
  const logoutDialog = (
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
            onClick={handleConfirmLogout}
          >
            Déconnexion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Different styles for mobile and desktop
  if (isMobile) {
    return (
      <>
        <button
          className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-red-600 text-left"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Mobile logout button clicked");
            handleLogoutClick();
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>

        {logoutDialog}
      </>
    );
  }

  // Desktop version
  return (
    <>
      <div
        className="flex items-center w-full px-2 py-1.5 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Desktop logout button clicked");
          handleLogoutClick();
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Déconnexion</span>
      </div>

      {logoutDialog}
    </>
  );
}
