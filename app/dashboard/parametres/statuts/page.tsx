"use client"

import { useState, useEffect, useMemo } from "react"
import { useStatus } from "@/contexts/status-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash, Edit, Save, X, AlertCircle, Database, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export default function StatusPage() {
  const { statuses, refreshStatuses, getStatusColor, error: statusError } = useStatus()
  const [loading, setLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [newStatus, setNewStatus] = useState({
    id: "",
    nom: "",
    couleur: "blue",
    ordre: 0,
    actif: true,
    type: "colis" // Must be exactly "colis" to match database constraint
  })

  // Log the initial type value
  useEffect(() => {
    console.log("Initial newStatus.type:", newStatus.type);
  }, [])

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
    { value: "gray", label: "Gris" },
    { value: "teal", label: "Turquoise" },
    { value: "indigo", label: "Indigo" },
    { value: "lime", label: "Vert Lime" },
    { value: "cyan", label: "Cyan" },
    { value: "amber", label: "Ambre" }
  ]

  const typeOptions = [
    { value: "colis", label: "Colis" },  // Must be exactly "colis" to match database constraint
    { value: "bon", label: "Bon" }       // Must be exactly "bon" to match database constraint
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

    // Validate that the type is exactly 'colis' or 'bon'
    console.log("Type value before validation:", newStatus.type, typeof newStatus.type);
    if (newStatus.type !== 'colis' && newStatus.type !== 'bon') {
      toast({
        title: "Erreur",
        description: "Le type de statut doit être 'colis' ou 'bon'",
        variant: "destructive"
      })
      console.log("Type validation failed. Expected 'colis' or 'bon', got:", newStatus.type);
      return
    }

    try {
      setLoading(true)

      // Set order to be the last if not specified
      const ordre = newStatus.ordre || statuses.length + 1

      // Prepare the data to insert - without specifying the ID
      // Let the database generate the UUID automatically

      // Use the type from the form, which should be either "colis" or "bon"
      const statusData = {
        nom: newStatus.nom,
        couleur: newStatus.couleur,
        ordre,
        actif: newStatus.actif,
        type: newStatus.type // This should be "colis" or "bon" from the dropdown
      }

      console.log("Submitting with type:", newStatus.type);

      // Log the exact data being sent to the database
      console.log("Sending data to database:", JSON.stringify(statusData, null, 2))

      console.log("Adding status with data:", statusData)

      // Insert the status
      const { data, error } = await supabase
        .from('statuts')
        .insert(statusData)
        .select()

      if (error) {
        console.error("Supabase error:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        console.error("Error message:", error.message)
        console.error("Error code:", error.code)

        // Check for specific error types
        if (error.code === '23505') {
          throw new Error(`Un statut avec ce nom existe déjà. Veuillez utiliser un nom différent.`)
        } else if (error.code === '42P01') {
          throw new Error("La table des statuts n'existe pas. Veuillez configurer la base de données.")
        } else if (error.message?.includes('violates check constraint "statuts_type_check"')) {
          throw new Error("Le type de statut doit être 'colis' ou 'bon'. Veuillez sélectionner un type valide.")
        } else {
          throw new Error(error.message ?? "Une erreur est survenue lors de l'ajout du statut")
        }
      }

      console.log("Status added successfully:", data)

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
        actif: true,
        type: "colis" // Must be exactly "colis" to match database constraint
      })
      setAddDialogOpen(false)

      // Refresh all statuses, including inactive ones
      await refreshStatuses(true)
    } catch (error: any) {
      console.error("Error adding status:", error)

      // Display a more user-friendly error message
      toast({
        title: "Erreur",
        description: error.message ?? "Impossible d'ajouter le statut. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditStatus = async () => {
    if (!editingStatus?.nom?.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du statut est requis",
        variant: "destructive"
      })
      return
    }

    // Validate that the type is exactly 'colis' or 'bon'
    if (editingStatus.type !== 'colis' && editingStatus.type !== 'bon') {
      toast({
        title: "Erreur",
        description: "Le type de statut doit être 'colis' ou 'bon'",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      // Prepare the data to update

      // Use the type from the form, which should be either "colis" or "bon"
      const statusData = {
        nom: editingStatus.nom,
        couleur: editingStatus.couleur,
        ordre: editingStatus.ordre,
        actif: editingStatus.actif,
        type: editingStatus.type // This should be "colis" or "bon" from the dropdown
      }

      console.log("Updating with type:", editingStatus.type);

      // Log the exact data being sent to the database
      console.log("Updating status with data:", JSON.stringify(statusData, null, 2))

      console.log("Updating status with data:", statusData)

      // Update the status
      const { data, error } = await supabase
        .from('statuts')
        .update(statusData)
        .eq('id', editingStatus.id)
        .select()

      if (error) {
        console.error("Supabase error:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        console.error("Error message:", error.message)
        console.error("Error code:", error.code)

        // Check for specific error types
        if (error.code === '42P01') {
          throw new Error("La table des statuts n'existe pas. Veuillez configurer la base de données.")
        } else if (error.message?.includes('violates check constraint "statuts_type_check"')) {
          throw new Error("Le type de statut doit être 'colis' ou 'bon'. Veuillez sélectionner un type valide.")
        } else {
          throw new Error(error.message || "Une erreur est survenue lors de la mise à jour du statut")
        }
      }

      console.log("Status updated successfully:", data)

      toast({
        title: "Succès",
        description: `Le statut "${editingStatus.nom}" a été mis à jour`
      })

      // Close dialog
      setEditDialogOpen(false)
      setEditingStatus(null)

      // Refresh all statuses, including inactive ones
      await refreshStatuses(true)
    } catch (error: any) {
      console.error("Error updating status:", error)

      // Display a more user-friendly error message
      toast({
        title: "Erreur",
        description: error.message ?? "Impossible de mettre à jour le statut. Veuillez réessayer.",
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

      console.log("Deleting status with ID:", deletingStatus.id)

      // Delete the status
      const { data, error } = await supabase
        .from('statuts')
        .delete()
        .eq('id', deletingStatus.id)
        .select()

      if (error) {
        console.error("Supabase error:", error)

        // Check for specific error types
        if (error.code === '42P01') {
          throw new Error("La table des statuts n'existe pas. Veuillez configurer la base de données.")
        } else if (error.code === '23503') {
          throw new Error("Ce statut est utilisé par des colis et ne peut pas être supprimé.")
        } else {
          throw new Error(error.message || "Une erreur est survenue lors de la suppression du statut")
        }
      }

      console.log("Status deleted successfully:", data)

      toast({
        title: "Succès",
        description: `Le statut "${deletingStatus.nom}" a été supprimé`
      })

      // Close dialog
      setDeleteDialogOpen(false)
      setDeletingStatus(null)

      // Refresh all statuses, including inactive ones
      await refreshStatuses(true)
    } catch (error: any) {
      console.error("Error deleting status:", error)

      // Display a more user-friendly error message
      toast({
        title: "Erreur",
        description: error.message ?? "Impossible de supprimer le statut. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (status: any) => {
    try {
      console.log("Toggling status active state:", status.id, "from", status.actif, "to", !status.actif)

      // Update the status active state
      const { data, error } = await supabase
        .from('statuts')
        .update({ actif: !status.actif })
        .eq('id', status.id)
        .select()

      if (error) {
        console.error("Supabase error:", error)

        // Check for specific error types
        if (error.code === '42P01') {
          throw new Error("La table des statuts n'existe pas. Veuillez configurer la base de données.")
        } else {
          throw new Error(error.message || "Une erreur est survenue lors de la modification du statut")
        }
      }

      console.log("Status active state toggled successfully:", data)

      toast({
        title: "Succès",
        description: `Le statut "${status.nom}" a été ${status.actif ? 'désactivé' : 'activé'}`
      })

      // Refresh all statuses, including inactive ones
      await refreshStatuses(true)
    } catch (error: any) {
      console.error("Error toggling status:", error)

      // Display a more user-friendly error message
      toast({
        title: "Erreur",
        description: error.message ?? "Impossible de modifier le statut. Veuillez réessayer.",
        variant: "destructive"
      })
    }
  }

  // Filter and paginate statuses
  const filteredStatuses = useMemo(() => {
    return statuses.filter(status => {
      // Filter by search query
      const matchesSearch = searchQuery === "" ||
        status.nom.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by type
      const matchesType = typeFilter === "all" || status.type === typeFilter;

      // Return true if both conditions are met
      return matchesSearch && matchesType;
    });
  }, [statuses, searchQuery, typeFilter]);

  // Get total count
  const totalCount = filteredStatuses.length;

  // Apply pagination
  const paginatedStatuses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStatuses.slice(startIndex, endIndex);
  }, [filteredStatuses, currentPage, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, typeFilter]);

  // Check if the statuses table exists
  const tableDoesNotExist = statusError && statusError.includes("relation") && statusError.includes("does not exist")

  // Redirect to setup page if table doesn't exist
  // Fetch all statuses, including inactive ones, when the component mounts
  useEffect(() => {
    // Fetch all statuses for the admin page
    refreshStatuses(true)
  }, [])

  useEffect(() => {
    if (tableDoesNotExist) {
      // Wait a bit to avoid immediate redirect
      const timer = setTimeout(() => {
        router.push('/dashboard/parametres/statuts/setup')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [tableDoesNotExist, router])

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
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
              onClick={() => router.push('/dashboard/parametres/statuts/setup')}
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

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          {(searchQuery || typeFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:flex md:flex-wrap gap-4 items-end">
          <div className="w-full md:flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un statut..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:flex-1">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type de statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {typeOptions.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des statuts</CardTitle>
            <div className="text-sm text-muted-foreground">
              {`${totalCount} statut${totalCount > 1 ? 's' : ''} trouvé${totalCount > 1 ? 's' : ''}`}
            </div>
          </div>
        </CardHeader>
        <CardContent>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totalCount === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Aucun statut trouvé avec les filtres actuels
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStatuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(status.nom)}>{status.nom}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{colorOptions.find(c => c.value === status.couleur)?.label ?? status.couleur}</TableCell>
                  <TableCell>{typeOptions.find(t => t.value === status.type)?.label ?? status.type}</TableCell>
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
              ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="mt-4">
              <DataTablePagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / pageSize)}
                pageSize={pageSize}
                totalItems={totalCount}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
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

              <div className="mt-2">
                <Label className="text-xs text-muted-foreground mb-2 block">Aperçu des couleurs:</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="status-blue">Bleu</Badge>
                  <Badge variant="outline" className="status-green">Vert</Badge>
                  <Badge variant="outline" className="status-red">Rouge</Badge>
                  <Badge variant="outline" className="status-yellow">Jaune</Badge>
                  <Badge variant="outline" className="status-orange">Orange</Badge>
                  <Badge variant="outline" className="status-purple">Violet</Badge>
                  <Badge variant="outline" className="status-pink">Rose</Badge>
                  <Badge variant="outline" className="status-gray">Gris</Badge>
                  <Badge variant="outline" className="status-teal">Turquoise</Badge>
                  <Badge variant="outline" className="status-indigo">Indigo</Badge>
                  <Badge variant="outline" className="status-lime">Vert Lime</Badge>
                  <Badge variant="outline" className="status-cyan">Cyan</Badge>
                  <Badge variant="outline" className="status-amber">Ambre</Badge>
                </div>
              </div>
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
            <div className="space-y-2">
              <Label htmlFor="type">Type de statut</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newStatus.type}
                onChange={(e) => {
                  console.log("Selected type value:", e.target.value);
                  setNewStatus({ ...newStatus, type: e.target.value });
                }}
              >
                <option value="colis">Colis</option>
                <option value="bon">Bon</option>
              </select>
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

                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">Aperçu des couleurs:</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="status-blue">Bleu</Badge>
                    <Badge variant="outline" className="status-green">Vert</Badge>
                    <Badge variant="outline" className="status-red">Rouge</Badge>
                    <Badge variant="outline" className="status-yellow">Jaune</Badge>
                    <Badge variant="outline" className="status-orange">Orange</Badge>
                    <Badge variant="outline" className="status-purple">Violet</Badge>
                    <Badge variant="outline" className="status-pink">Rose</Badge>
                    <Badge variant="outline" className="status-gray">Gris</Badge>
                    <Badge variant="outline" className="status-teal">Turquoise</Badge>
                    <Badge variant="outline" className="status-indigo">Indigo</Badge>
                    <Badge variant="outline" className="status-lime">Vert Lime</Badge>
                    <Badge variant="outline" className="status-cyan">Cyan</Badge>
                    <Badge variant="outline" className="status-amber">Ambre</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ordre">Ordre d'affichage</Label>
                <Input
                  id="edit-ordre"
                  type="number"
                  value={editingStatus.ordre ?? ''}
                  onChange={(e) => setEditingStatus({ ...editingStatus, ordre: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type de statut</Label>
                <select
                  id="edit-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingStatus.type ?? 'colis'}
                  onChange={(e) => setEditingStatus({ ...editingStatus, type: e.target.value })}
                >
                  <option value="colis">Colis</option>
                  <option value="bon">Bon</option>
                </select>
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
