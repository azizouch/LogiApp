'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Phone,
  MessageCircle,
  Eye,
  RotateCcw,
  AlertCircle,
  MessageSquare,
  Send,
  Package,
  Save,
  Building2,
  MapPin,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { useStatus } from '@/contexts/status-context'
import { createReclamationNotification } from '@/lib/notification-utils'
import { useAuth } from '@/contexts/auth-context'

interface ColisCardProps {
  id: string
  clientName: string
  clientPhone?: string
  clientAddress?: string
  clientCity?: string
  entrepriseName: string
  amount: number
  frais?: number
  status: string
  date: string
}

export function ColisCard({
  id,
  clientName,
  clientPhone = '',
  clientAddress = '',
  clientCity = '',
  entrepriseName,
  amount,
  frais = 0,
  status,
  date
}: ColisCardProps) {
  const [reclamationOpen, setReclamationOpen] = useState(false)
  const [reclamationText, setReclamationText] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(status)
  const [statusNote, setStatusNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Get the status context
  const { getStatusColor: contextGetStatusColor, statuses } = useStatus()

  // Function to get status color
  const getStatusColor = (status: string) => {
    return contextGetStatusColor(status)
  }

  // Get the current user
  const { user } = useAuth()

  // Function to handle sending reclamation
  const handleSendReclamation = async () => {
    if (!reclamationText.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un message de réclamation",
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

    try {
      // Set a flag in localStorage to prevent duplicate submissions
      const submissionKey = `reclamation_${id}_${Date.now()}`
      if (localStorage.getItem(submissionKey)) {
        console.log('Preventing duplicate submission')
        return
      }
      localStorage.setItem(submissionKey, 'true')

      // Create a notification for admins and gestionnaires
      const result = await createReclamationNotification({
        colisId: id,
        livreurId: user.id,
        message: reclamationText.trim(),
        type: "warning"
      })

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'envoi de la réclamation")
      }

      toast({
        title: "Réclamation envoyée",
        description: "Votre signalement a été transmis aux gestionnaires",
      })

      setReclamationText('')
      setReclamationOpen(false)

      // Clear the flag after successful submission
      setTimeout(() => {
        localStorage.removeItem(submissionKey)
      }, 5000)
    } catch (error) {
      console.error("Error submitting reclamation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la réclamation",
        variant: "destructive"
      })
    }
  }

  // Function to open WhatsApp
  const openWhatsApp = () => {
    if (!clientPhone || clientPhone === '') {
      toast({
        title: "Erreur",
        description: "Numéro de téléphone client non disponible",
        variant: "destructive"
      })
      return
    }

    try {
      // Format phone number (remove spaces, add country code if needed)
      const formattedPhone = clientPhone.replace(/\s/g, '').replace(/-/g, '')
      const phoneWithPrefix = formattedPhone.startsWith('+')
        ? formattedPhone
        : `+212${formattedPhone.startsWith('0') ? formattedPhone.substring(1) : formattedPhone}`

      // Open WhatsApp with pre-filled message
      const message = `Bonjour, je suis le livreur pour votre colis ${id}. `
      const whatsappUrl = `https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    } catch (error) {
      console.error('Error opening WhatsApp:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir WhatsApp. Vérifiez le numéro de téléphone.",
        variant: "destructive"
      })
    }
  }

  // Function to send SMS
  const sendSMS = () => {
    if (!clientPhone || clientPhone === '') {
      toast({
        title: "Erreur",
        description: "Numéro de téléphone client non disponible",
        variant: "destructive"
      })
      return
    }

    try {
      // Format phone number
      const formattedPhone = clientPhone.replace(/\s/g, '').replace(/-/g, '')

      // Open SMS app with pre-filled message
      const message = `Bonjour, je suis le livreur pour votre colis ${id}. `
      const smsUrl = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`
      window.open(smsUrl, '_blank')
    } catch (error) {
      console.error('Error sending SMS:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer un SMS. Vérifiez le numéro de téléphone.",
        variant: "destructive"
      })
    }
  }

  // Function to call client
  const callClient = () => {
    if (!clientPhone || clientPhone === '') {
      toast({
        title: "Erreur",
        description: "Numéro de téléphone client non disponible",
        variant: "destructive"
      })
      return
    }

    try {
      // Format phone number
      const formattedPhone = clientPhone.replace(/\s/g, '').replace(/-/g, '')

      // Open phone app
      window.open(`tel:${formattedPhone}`, '_blank')
    } catch (error) {
      console.error('Error making call:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'appeler le client. Vérifiez le numéro de téléphone.",
        variant: "destructive"
      })
    }
  }

  // Vendor phone numbers (would normally come from a database)
  const vendorPhones = {
    'B': '+212600000000', // Example phone for Vendeur B
    'P': '+212600000001'  // Example phone for Vendeur P
  }

  // Function to call vendor
  const callVendor = (vendorType: 'B' | 'P') => {
    const vendorPhone = vendorPhones[vendorType]

    if (!vendorPhone) {
      toast({
        title: "Erreur",
        description: `Numéro de téléphone du Vendeur ${vendorType} non disponible`,
        variant: "destructive"
      })
      return
    }

    try {
      // Open phone app
      window.open(`tel:${vendorPhone}`, '_blank')
    } catch (error) {
      console.error('Error making call:', error)
      toast({
        title: "Erreur",
        description: `Impossible d'appeler le Vendeur ${vendorType}.`,
        variant: "destructive"
      })
    }
  }

  // Function to message vendor on WhatsApp
  const messageVendor = (vendorType: 'B' | 'P') => {
    const vendorPhone = vendorPhones[vendorType]

    if (!vendorPhone) {
      toast({
        title: "Erreur",
        description: `Numéro de téléphone du Vendeur ${vendorType} non disponible`,
        variant: "destructive"
      })
      return
    }

    try {
      // Open WhatsApp with pre-filled message
      const message = `Bonjour, je suis le livreur pour le colis ${id}. `
      const whatsappUrl = `https://wa.me/${vendorPhone}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    } catch (error) {
      console.error('Error opening WhatsApp:', error)
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer un message au Vendeur ${vendorType}.`,
        variant: "destructive"
      })
    }
  }

  // Function to update colis status
  const updateColisStatus = async () => {
    if (newStatus === status) {
      toast({
        title: "Information",
        description: "Aucun changement de statut détecté",
      })
      return
    }

    try {
      setIsUpdating(true)

      // Update colis status in database
      const { error } = await supabase
        .from('colis')
        .update({
          statut: newStatus,
          date_mise_a_jour: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        throw error
      }

      // Add to history if needed
      if (statusNote.trim()) {
        const { error: historyError } = await supabase
          .from('historique_colis')
          .insert({
            colis_id: id,
            statut: newStatus,
            notes: statusNote,
            date_creation: new Date().toISOString()
          })

        if (historyError) {
          console.error('Error adding to history:', historyError)
          // Continue anyway as the main update was successful
        }
      }

      toast({
        title: "Succès",
        description: `Le statut du colis a été mis à jour vers "${newStatus}"`,
      })

      // Close the dialog after successful update
      setStatusModalOpen(false)

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut du colis",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border hover:shadow-md transition-all">
        <CardContent className="p-0">
          {/* Header with ID and date */}
          <div className="flex justify-between items-center p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{id || 'ID inconnu'}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}
            </div>
          </div>

          {/* Main content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="font-semibold">{clientName || 'Client inconnu'}</h3>
                {clientPhone && clientPhone !== '' && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 mr-1 inline" />
                    <span>{clientPhone}</span>
                  </div>
                )}
                {clientAddress && clientAddress !== '' && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Home className="h-3 w-3 mr-1 inline" />
                    <span>{clientAddress}</span>
                  </div>
                )}
                {clientCity && clientCity !== '' && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1 inline" />
                    <span>{clientCity}</span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className={getStatusColor(status || 'En attente')}>
                {status || 'En attente'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground flex items-center">
                <Building2 className="h-3 w-3 mr-1 inline" />
                <span>{entrepriseName || 'Entreprise inconnue'}</span>
              </div>
              <div className="text-xl font-bold">
                {amount || 0} DH {frais > 0 && <span className="text-sm text-muted-foreground ml-1">(+{frais} frais)</span>}
              </div>
            </div>

            {/* Vendor Buttons */}
            <div className="mt-4">
              <div className="grid grid-cols-2 md:flex md:flex-row gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full md:flex-1 h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => callVendor('B')}
                >
                  <Phone className="mr-1 h-3 w-3" />
                  Vendeur B
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full md:flex-1 h-8 text-xs bg-green-600 text-white hover:bg-green-700"
                  onClick={() => messageVendor('B')}
                >
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Vendeur B
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full md:flex-1 h-8 text-xs bg-purple-600 text-white hover:bg-purple-700"
                  onClick={() => callVendor('P')}
                >
                  <Phone className="mr-1 h-3 w-3" />
                  Vendeur P
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full md:flex-1 h-8 text-xs bg-pink-600 text-white hover:bg-pink-700"
                  onClick={() => messageVendor('P')}
                >
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Vendeur P
                </Button>
              </div>
            </div>

            {/* Status Change Button - Only show if not already delivered */}
            {status.toLowerCase() !== 'livré' && (
              <div className="mt-4">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setStatusModalOpen(true)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Changer le statut
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        {/* Action buttons */}
        <CardFooter className="flex p-3 bg-muted/20">
          <div className="grid grid-cols-5 gap-4 w-full md:flex md:justify-between md:gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-[10px] bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 h-10 w-12 md:flex-1"
              onClick={() => setReclamationOpen(true)}
              title="Réclamation"
            >
              <AlertCircle className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-[10px] bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 h-10 w-12 md:flex-1"
              onClick={openWhatsApp}
              title="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-[10px] bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700 h-10 w-12 md:flex-1"
              onClick={sendSMS}
              title="SMS"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-[10px] bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 h-10 w-12 md:flex-1"
              onClick={callClient}
              title="Appeler"
            >
              <Phone className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-[10px] bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 h-10 w-12 md:flex-1"
              onClick={() => setDetailsOpen(true)}
              title="Voir détails"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Reclamation Dialog */}
      <Dialog open={reclamationOpen} onOpenChange={setReclamationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une réclamation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Colis ID: <span className="font-medium text-foreground">{id}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Client: <span className="font-medium text-foreground">{clientName}</span>
              </p>
            </div>
            <Textarea
              placeholder="Décrivez votre réclamation ici..."
              value={reclamationText}
              onChange={(e) => setReclamationText(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReclamationOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendReclamation}>
              <Send className="mr-2 h-5 w-5" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Save className="mr-2 h-5 w-5" />
              Changer le statut du colis
            </DialogTitle>
            <DialogDescription>
              Mettre à jour le statut du colis #{id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Statut actuel:</p>
                <Badge variant="outline" className={getStatusColor(status || 'En attente')}>
                  {status || 'En attente'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStatus">Nouveau statut</Label>
              <Select
                defaultValue={status}
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses && statuses.length > 0 ? (
                    statuses.map((status) => (
                      <SelectItem key={status.id} value={status.nom}>
                        {status.nom}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback options if statuses aren't loaded
                    <>
                      <SelectItem value="En attente">En attente</SelectItem>
                      <SelectItem value="Pris en charge">Pris en charge</SelectItem>
                      <SelectItem value="En cours de livraison">En cours de livraison</SelectItem>
                      <SelectItem value="Livré">Livré</SelectItem>
                      <SelectItem value="Refusé">Refusé</SelectItem>
                      <SelectItem value="Annulé">Annulé</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusNote">Note (optionnel)</Label>
              <Textarea
                id="statusNote"
                placeholder="Ajouter une note concernant le changement de statut..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={updateColisStatus}
              disabled={isUpdating || newStatus === status}
            >
              {isUpdating ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Mettre à jour
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Détails du Colis
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur le colis et options de gestion
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Colis Information */}
            <div>
              <h3 className="text-base font-semibold mb-2 border-b pb-1 flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Informations du Colis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">ID Colis</h4>
                  <p className="font-mono bg-muted p-1 rounded text-xs">{id}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Date</h4>
                  <p>{date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Statut</h4>
                  <Badge variant="outline" className={getStatusColor(status || 'En attente')}>
                    {status || 'En attente'}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Prix</h4>
                  <p className="font-semibold">{amount || 0} DH</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Frais</h4>
                  <p>{frais > 0 ? `${frais} DH` : 'Aucun'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Total</h4>
                  <p className="font-bold">{(Number(amount) + Number(frais)) || 0} DH</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Information */}
              <div>
                <h3 className="text-base font-semibold mb-2 border-b pb-1 flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Client
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Nom</h4>
                    <p>{clientName}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Téléphone</h4>
                    <p>{clientPhone || 'Non disponible'}</p>
                  </div>

                  {clientAddress && clientAddress !== '' && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground">Adresse</h4>
                      <p>{clientAddress}</p>
                    </div>
                  )}

                  {clientCity && clientCity !== '' && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground">Ville</h4>
                      <p>{clientCity}</p>
                    </div>
                  )}

                  {clientPhone && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground">Contacts</h4>
                      <div className="flex gap-2 mt-1">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={callClient} title="Appeler">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={sendSMS} title="SMS">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={openWhatsApp} title="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Entreprise Information */}
              <div>
                <h3 className="text-base font-semibold mb-2 border-b pb-1 flex items-center">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Entreprise
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Nom</h4>
                    <p>{entrepriseName !== 'N/A' ? entrepriseName : 'Aucune entreprise associée'}</p>
                  </div>

                  {entrepriseName !== 'N/A' && (
                    <>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Email</h4>
                        <p>contact@{entrepriseName.toLowerCase().replace(/\s+/g, '')}.com</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Téléphone</h4>
                        <p>+212 5XX-XXXXXX</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Adresse</h4>
                        <p>Casablanca, Maroc</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Vendor Contacts */}
            <div>
              <h3 className="text-base font-semibold mb-2 border-b pb-1 flex items-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contacts Vendeurs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground">Vendeur B</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => callVendor('B')}
                    >
                      <Phone className="mr-1 h-3 w-3" />
                      Appeler
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => messageVendor('B')}
                    >
                      <MessageCircle className="mr-1 h-3 w-3" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground">Vendeur P</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => callVendor('P')}
                    >
                      <Phone className="mr-1 h-3 w-3" />
                      Appeler
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => messageVendor('P')}
                    >
                      <MessageCircle className="mr-1 h-3 w-3" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>


          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
