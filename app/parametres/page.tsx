"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { supabase } from '@/lib/supabase'

export default function ParametresPage() {
  const [loading, setLoading] = useState(false)
  const [colisStatuses, setColisStatuses] = useState<{id: string, nom: string, type: string}[]>([])
  const [bonStatuses, setBonStatuses] = useState<{id: string, nom: string, type: string}[]>([])

  // Status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<{id: string, nom: string, type: string} | null>(null)
  const [statusName, setStatusName] = useState('')
  const [statusType, setStatusType] = useState('colis')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load statuses from database
  useEffect(() => {
    async function loadStatuses() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('statuts')
          .select('*')
          .order('nom', { ascending: true })

        if (error) throw error

        // Split statuses by type
        const colisStatuses = data.filter(status => status.type === 'colis')
        const bonStatuses = data.filter(status => status.type === 'bon')

        setColisStatuses(colisStatuses)
        setBonStatuses(bonStatuses)
      } catch (error) {
        console.error('Error loading statuses:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les statuts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStatuses()
  }, [])

  // Handle adding/editing status
  const handleSaveStatus = async () => {
    if (!statusName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du statut ne peut pas être vide",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (editingStatus) {
        // Update existing status
        const { error } = await supabase
          .from('statuts')
          .update({ nom: statusName, type: statusType })
          .eq('id', editingStatus.id)

        if (error) throw error

        // Update local state
        if (statusType === 'colis') {
          setColisStatuses(prev =>
            prev.map(status =>
              status.id === editingStatus.id
                ? { ...status, nom: statusName }
                : status
            )
          )
        } else {
          setBonStatuses(prev =>
            prev.map(status =>
              status.id === editingStatus.id
                ? { ...status, nom: statusName }
                : status
            )
          )
        }

        toast({
          title: "Succès",
          description: "Le statut a été mis à jour",
        })
      } else {
        // Add new status
        const { data, error } = await supabase
          .from('statuts')
          .insert({ nom: statusName, type: statusType })
          .select()

        if (error) throw error

        // Update local state
        if (statusType === 'colis') {
          setColisStatuses(prev => [...prev, data[0]])
        } else {
          setBonStatuses(prev => [...prev, data[0]])
        }

        toast({
          title: "Succès",
          description: "Le statut a été ajouté",
        })
      }

      // Reset form and close dialog
      setStatusDialogOpen(false)
      setEditingStatus(null)
      setStatusName('')
    } catch (error: any) {
      console.error('Error saving status:', error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting status
  const handleDeleteStatus = async (status: {id: string, nom: string, type: string}) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le statut "${status.nom}" ?`)) {
      try {
        const { error } = await supabase
          .from('statuts')
          .delete()
          .eq('id', status.id)

        if (error) throw error

        // Update local state
        if (status.type === 'colis') {
          setColisStatuses(prev => prev.filter(s => s.id !== status.id))
        } else {
          setBonStatuses(prev => prev.filter(s => s.id !== status.id))
        }

        toast({
          title: "Succès",
          description: "Le statut a été supprimé",
        })
      } catch (error: any) {
        console.error('Error deleting status:', error)
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue",
          variant: "destructive",
        })
      }
    }
  }

  // Open dialog for adding new status
  const openAddDialog = (type: string) => {
    setEditingStatus(null)
    setStatusName('')
    setStatusType(type)
    setStatusDialogOpen(true)
  }

  // Open dialog for editing status
  const openEditDialog = (status: {id: string, nom: string, type: string}) => {
    setEditingStatus(status)
    setStatusName(status.nom)
    setStatusType(status.type)
    setStatusDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">Configurez les paramètres de votre système de gestion logistique</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="numerotation">Numérotation</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
                <CardDescription>
                  Ces informations apparaîtront sur les bons de distribution et autres documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nom de l'entreprise</Label>
                  <Input id="company-name" defaultValue="LogiTrack" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address">Adresse</Label>
                  <Input id="company-address" defaultValue="123 Rue de la Logistique" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-city">Ville</Label>
                  <Input id="company-city" defaultValue="75001 Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Téléphone</Label>
                  <Input id="company-phone" defaultValue="01 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" defaultValue="contact@logitrack.fr" />
                </div>
                <Button className="mt-4">Enregistrer</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences système</CardTitle>
                <CardDescription>Configurez les préférences générales du système</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des notifications par email lors des changements de statut
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Signature électronique</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la signature électronique pour les bons de distribution
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Historique des statuts</Label>
                    <p className="text-sm text-muted-foreground">Conserver l'historique des changements de statut</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="mt-4">Enregistrer</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="numerotation">
          <Card>
            <CardHeader>
              <CardTitle>Format de numérotation</CardTitle>
              <CardDescription>
                Configurez le format des numéros pour les colis et les bons de distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Format des numéros de colis</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="colis-prefix">Préfixe</Label>
                    <Input id="colis-prefix" defaultValue="COL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colis-separator">Séparateur</Label>
                    <Input id="colis-separator" defaultValue="-" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colis-year">Inclure l'année</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger id="colis-year">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Oui</SelectItem>
                        <SelectItem value="no">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colis-digits">Nombre de chiffres</Label>
                    <Select defaultValue="4">
                      <SelectTrigger id="colis-digits">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 chiffres</SelectItem>
                        <SelectItem value="4">4 chiffres</SelectItem>
                        <SelectItem value="5">5 chiffres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Aperçu: <strong>COL-2025-0001</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Format des numéros de bons de distribution</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bon-prefix">Préfixe</Label>
                    <Input id="bon-prefix" defaultValue="BD" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bon-separator">Séparateur</Label>
                    <Input id="bon-separator" defaultValue="-" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bon-year">Inclure l'année</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger id="bon-year">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Oui</SelectItem>
                        <SelectItem value="no">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bon-digits">Nombre de chiffres</Label>
                    <Select defaultValue="4">
                      <SelectTrigger id="bon-digits">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 chiffres</SelectItem>
                        <SelectItem value="4">4 chiffres</SelectItem>
                        <SelectItem value="5">5 chiffres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Aperçu: <strong>BD-2025-0001</strong>
                  </p>
                </div>
              </div>

              <Button>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  )
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  )
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b transition-colors hover:bg-muted/50">{children}</tr>
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`h-12 px-4 text-left align-middle font-medium ${className || ""}`}>{children}</th>
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-4 align-middle ${className || ""}`}>{children}</td>
}
