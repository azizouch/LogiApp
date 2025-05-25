"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ConfirmationDialogProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onConfirm: () => Promise<void> | void
  children: React.ReactNode
}

export function ConfirmationDialog({
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "destructive",
  onConfirm,
  children,
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm()
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <Button 
            variant={variant} 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
