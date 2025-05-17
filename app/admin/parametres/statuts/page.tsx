"use client"

import { useState, useEffect } from "react"
import { useStatus } from "@/contexts/status-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash, Edit, Save, X, AlertCircle, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StatusPage() {
  const { statuses, refreshStatuses, getStatusColor, error: statusError } = useStatus()
  const [loading, setLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const [newStatus, setNewStatus] = useState({
    id: "",
    nom: "",
    couleur: "blue",
    ordre: 0,
    actif: true
  })

  const [editingStatus, setEditingStatus] = useState<any>(null)
  const [deletingStatus, setDeletingStatus] = useState<any>(null)

  const colorOptions = [
    { value: "blue", label: "Bleu" },
    { value: "green", label: "Vert" },
    { value: "red", label: "Rouge" },
    { value: "yellow", label: "Jaune" },
    { value: "orange", label: "Orange" },
    { value: "purple", label: "Violet" },
    { value: "pink", label: "Rose" },
    { value: "gray", label: "Gris" }
  ]

  const handleAddStatus = async () => {
    if (!newStatus.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du statut est requis",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      // Generate ID from name
      const id = newStatus.nom.toLowerCase().replace(/\s+/g, '-')

      // Set order to be the last if not specified
      const ordre = newStatus.ordre || statuses.length + 1

      const { error } = await supabase
        .from('statuses')
        .insert({
          id,
          nom: newStatus.nom,
          couleur: newStatus.couleur,
          ordre,
          actif: newStatus.actif
        })

      if (error) throw error

      toast({
        title: "Succès",
        description: `Le statut "${newStatus.nom}" a été ajouté`
      })

      // Reset form and close dialog
      setNewStatus({
        id: "",
        nom: "",
        couleur: "blue",
        ordre: 0,
        actif: true
      })
      setAddDialogOpen(false)

      // Refresh statuses
      await refreshStatuses()
    } catch (error: any) {
      console.error("Error adding status:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le statut",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditStatus = async () => {
    if (!editingStatus || !editingStatus.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du statut est requis",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('statuses')
        .update({
          nom: editingStatus.nom,
          couleur: editingStatus.couleur,
          ordre: editingStatus.ordre,
          actif: editingStatus.actif
        })
        .eq('id', editingStatus.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: `Le statut "${editingStatus.nom}" a été mis à jour`
      })

      // Close dialog
      setEditDialogOpen(false)
      setEditingStatus(null)

      // Refresh statuses
      await refreshStatuses()
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStatus = async () => {
    if (!deletingStatus) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('statuses')
        .delete()
        .eq('id', deletingStatus.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: `Le statut "${deletingStatus.nom}" a été supprimé`
      })

      // Close dialog
      setDeleteDialogOpen(false)
      setDeletingStatus(null)

      // Refresh statuses
      await refreshStatuses()
    } catch (error: any) {
      console.error("Error deleting status:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le statut",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (status: any) => {
    try {
      const { error } = await supabase
        .from('statuses')
        .update({ actif: !status.actif })
        .eq('id', status.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: `Le statut "${status.nom}" a été ${status.actif ? 'désactivé' : 'activé'}`
      })

      // Refresh statuses
      await refreshStatuses()
    } catch (error: any) {
      console.error("Error toggling status:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le statut",
        variant: "destructive"
      })
    }
  }

  // Check if the statuses table exists
  const tableDoesNotExist = statusError && statusError.includes("relation") && statusError.includes("does not exist")

  // Redirect to setup page if table doesn't exist
  useEffect(() => {
    if (tableDoesNotExist) {
      // Wait a bit to avoid immediate redirect
      const timer = setTimeout(() => {
        router.push('/admin/parametres/statuts/setup')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [tableDoesNotExist, router])

  return (
    <div className="container mx-auto py-6">
      {tableDoesNotExist ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuration requise
            </CardTitle>
            <CardDescription>
              La table des statuts n'existe pas encore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Table manquante</AlertTitle>
              <AlertDescription>
                La table des statuts n'existe pas dans votre base de données. Vous allez être redirigé vers la page de configuration.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push('/admin/parametres/statuts/setup')}
              className="w-full"
            >
              Aller à la page de configuration
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestion des Statuts</h1>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un statut
            </Button>
          </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des statuts</CardTitle>
          <CardDescription>Gérez les statuts disponibles pour les colis</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(status.nom)}>{status.nom}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{colorOptions.find(c => c.value === status.couleur)?.label || status.couleur}</TableCell>
                  <TableCell>{status.ordre}</TableCell>
                  <TableCell>
                    <Switch
                      checked={status.actif}
                      onCheckedChange={() => handleToggleActive(status)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingStatus(status)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => {
                          setDeletingStatus(status)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </>
      )}

      {/* Add Status Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un statut</DialogTitle>
            <DialogDescription>Créez un nouveau statut pour les colis</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du statut</Label>
              <Input
                id="nom"
                value={newStatus.nom}
                onChange={(e) => setNewStatus({ ...newStatus, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couleur">Couleur</Label>
              <select
                id="couleur"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newStatus.couleur}
                onChange={(e) => setNewStatus({ ...newStatus, couleur: e.target.value })}
              >
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordre">Ordre d'affichage</Label>
              <Input
                id="ordre"
                type="number"
                value={newStatus.ordre || ''}
                onChange={(e) => setNewStatus({ ...newStatus, ordre: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="actif"
                checked={newStatus.actif}
                onCheckedChange={(checked) => setNewStatus({ ...newStatus, actif: checked })}
              />
              <Label htmlFor="actif">Actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddStatus} disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un statut</DialogTitle>
            <DialogDescription>Modifiez les informations du statut</DialogDescription>
          </DialogHeader>
          {editingStatus && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom du statut</Label>
                <Input
                  id="edit-nom"
                  value={editingStatus.nom}
                  onChange={(e) => setEditingStatus({ ...editingStatus, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-couleur">Couleur</Label>
                <select
                  id="edit-couleur"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingStatus.couleur}
                  onChange={(e) => setEditingStatus({ ...editingStatus, couleur: e.target.value })}
                >
                  {colorOptions.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ordre">Ordre d'affichage</Label>
                <Input
                  id="edit-ordre"
                  type="number"
                  value={editingStatus.ordre || ''}
                  onChange={(e) => setEditingStatus({ ...editingStatus, ordre: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-actif"
                  checked={editingStatus.actif}
                  onCheckedChange={(checked) => setEditingStatus({ ...editingStatus, actif: checked })}
                />
                <Label htmlFor="edit-actif">Actif</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditStatus} disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Status Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              Supprimer le statut
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce statut ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {deletingStatus && (
            <div className="py-4">
              <p className="text-sm">
                Vous êtes sur le point de supprimer le statut <strong>{deletingStatus.nom}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteStatus} disabled={loading}>
              {loading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
