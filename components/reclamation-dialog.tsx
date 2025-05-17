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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2 } from "lucide-react"
import { createReclamationNotification } from "@/lib/notification-utils"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ReclamationDialogProps {
  colisId: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonText?: string
  className?: string
}

export function ReclamationDialog({
  colisId,
  buttonVariant = "outline",
  buttonSize = "sm",
  buttonText = "Signaler un problème",
  className
}: ReclamationDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message requis",
        description: "Veuillez décrire le problème rencontré",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour signaler un problème",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      const result = await createReclamationNotification({
        colisId,
        livreurId: user.id,
        message: message.trim(),
        type: "warning"
      })

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'envoi de la réclamation")
      }

      toast({
        title: "Réclamation envoyée",
        description: "Votre signalement a été transmis aux gestionnaires",
      })

      setMessage("")
      setOpen(false)
    } catch (error) {
      console.error("Error submitting reclamation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la réclamation",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Signaler un problème</DialogTitle>
          <DialogDescription>
            Décrivez le problème rencontré avec ce colis. Cette information sera transmise aux gestionnaires.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reclamation-message">Description du problème</Label>
            <Textarea
              id="reclamation-message"
              placeholder="Décrivez le problème rencontré..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              "Envoyer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
