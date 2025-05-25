"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Search, Plus, Edit, Trash, UserPlus, UserCog, Mail, Phone, Shield, CheckCircle, Loader2, ShieldCheck, AlertCircle, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@supabase/supabase-js'
import { Utilisateur } from "@/lib/db/utilisateur"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function UtilisateurPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isRolesOpen, setIsRolesOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null)
  const [deletingUser, setDeletingUser] = useState<Utilisateur | null>(null)
  const [users, setUsers] = useState<Utilisateur[]>([])
  const [loading, setLoading] = useState(true)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [paginatedUsers, setPaginatedUsers] = useState<Utilisateur[]>([])
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'Gestionnaire',
    mot_de_passe: '',
    statut: 'Actif',
    adresse: '',
    ville: '',
    vehicule: '',
    zone: ''
  })

  // Fetch users from the database
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)

        // First, ensure the table exists
        try {
          const response = await fetch('/api/db/create-utilisateur-table')
          const result = await response.json()

          if (result.success) {
            console.log('Table creation successful:', result.message)
          } else {
            console.warn('Table creation warning:', result.error)
            // Continue anyway, the table might already exist
          }
        } catch (tableError) {
          console.warn('Error checking table:', tableError)
          // Continue anyway, we'll handle any errors in the next step
        }

        // Now fetch the users
        try {
          const { data, error } = await supabase
            .from('utilisateurs')
            .select('*')
            .order('nom')

          if (error) {
            throw error
          }

          setUsers(data || [])
        } catch (fetchError) {
          console.error('Error fetching users:', fetchError)
          toast({
            title: "Erreur",
            description: "Impossible de charger les utilisateurs. Veuillez vérifier votre connexion à Supabase.",
            variant: "destructive"
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Handle search and pagination
  useEffect(() => {
    // Filter users based on search term and filters
    const filtered = users.filter(user => {
      const matchesSearch = searchTerm === "" ||
        `${user.nom} ${user.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.statut.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.statut === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })

    // Update total count
    setTotalCount(filtered.length)

    // Reset to first page when search changes
    if (searchTerm && currentPage !== 1) {
      setCurrentPage(1)
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setPaginatedUsers(filtered.slice(startIndex, endIndex))
  }, [users, searchTerm, roleFilter, statusFilter, currentPage, pageSize])

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
  }

  const handleEditUser = (user: Utilisateur) => {
    setCurrentUser(user)
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      role: user.role,
      mot_de_passe: '',
      statut: user.statut,
      adresse: (user as any).adresse || '',
      ville: (user as any).ville || '',
      vehicule: (user as any).vehicule || '',
      zone: (user as any).zone || ''
    })
    setIsEditUserOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Validate for duplicates
  const validateDuplicates = async (isEdit: boolean = false, currentUserId?: string) => {
    // Check for duplicate email
    const { data: existingEmail, error: emailError } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('email', formData.email)
      .neq('id', isEdit && currentUserId ? currentUserId : '')
      .maybeSingle()

    if (emailError) {
      console.error('Error checking email:', emailError)
    }

    if (existingEmail) {
      toast({
        title: "Erreur de validation",
        description: "Un utilisateur avec cet email existe déjà",
        variant: "destructive"
      })
      return false
    }

    // Check for duplicate phone number if provided
    if (formData.telephone && formData.telephone.trim() !== '') {
      const { data: existingPhone, error: phoneError } = await supabase
        .from('utilisateurs')
        .select('id')
        .eq('telephone', formData.telephone)
        .neq('id', isEdit && currentUserId ? currentUserId : '')
        .maybeSingle()

      if (phoneError) {
        console.error('Error checking phone:', phoneError)
      }

      if (existingPhone) {
        toast({
          title: "Erreur de validation",
          description: "Un utilisateur avec ce numéro de téléphone existe déjà",
          variant: "destructive"
        })
        return false
      }
    }

    // Check for duplicate password
    const { data: existingPassword, error: passwordError } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('mot_de_passe', formData.mot_de_passe)
      .neq('id', isEdit && currentUserId ? currentUserId : '')
      .maybeSingle()

    if (passwordError) {
      console.error('Error checking password:', passwordError)
    }

    if (existingPassword) {
      toast({
        title: "Erreur de validation",
        description: "Ce mot de passe est déjà utilisé par un autre utilisateur",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleAddUser = async () => {
    try {
      if (!formData.nom || !formData.prenom || !formData.email || !formData.role) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        })
        return
      }

      if (!formData.mot_de_passe) {
        toast({
          title: "Erreur",
          description: "Le mot de passe est obligatoire pour un nouvel utilisateur",
          variant: "destructive"
        })
        return
      }

      // Validate for duplicates
      const isValid = await validateDuplicates(false)
      if (!isValid) {
        return
      }

      const userData: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone || null,
        role: formData.role as 'Admin' | 'Gestionnaire' | 'Livreur',
        mot_de_passe: formData.mot_de_passe, // In a real app, this should be hashed
        statut: formData.statut as 'Actif' | 'Inactif',
        adresse: formData.adresse || null,
        ville: formData.ville || null
      }

      // Add livreur-specific fields if role is Livreur
      if (formData.role === 'Livreur') {
        userData.vehicule = formData.vehicule || null
        userData.zone = formData.zone || null
      }

      const { data, error } = await supabase
        .from('utilisateurs')
        .insert([userData])
        .select()

      if (error) {
        throw error
      }

      setUsers(prev => [...prev, data[0]])
      setIsAddUserOpen(false)
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'Gestionnaire',
        mot_de_passe: '',
        statut: 'Actif',
        adresse: '',
        ville: '',
        vehicule: '',
        zone: ''
      })

      toast({
        title: "Succès",
        description: "Utilisateur ajouté avec succès",
      })
    } catch (error) {
      console.error('Error adding user:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'utilisateur",
        variant: "destructive"
      })
    }
  }

  const handleUpdateUser = async () => {
    try {
      if (!currentUser) return

      if (!formData.nom || !formData.prenom || !formData.email || !formData.role) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        })
        return
      }

      // Validate for duplicates (excluding current user)
      const isValid = await validateDuplicates(true, currentUser.id)
      if (!isValid) {
        return
      }

      const updateData: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone || null,
        role: formData.role as 'Admin' | 'Gestionnaire' | 'Livreur',
        statut: formData.statut as 'Actif' | 'Inactif',
        adresse: formData.adresse || null,
        ville: formData.ville || null
      }

      // Add livreur-specific fields if role is Livreur
      if (formData.role === 'Livreur') {
        updateData.vehicule = formData.vehicule || null
        updateData.zone = formData.zone || null
      } else {
        // Clear livreur fields if role is not Livreur
        updateData.vehicule = null
        updateData.zone = null
      }

      // Only update password if provided
      if (formData.mot_de_passe) {
        updateData.mot_de_passe = formData.mot_de_passe // In a real app, this should be hashed
      }

      const { data, error } = await supabase
        .from('utilisateurs')
        .update(updateData)
        .eq('id', currentUser.id)
        .select()

      if (error) {
        throw error
      }

      setUsers(prev => prev.map(user => user.id === currentUser.id ? data[0] : user))
      setIsEditUserOpen(false)
      setCurrentUser(null)

      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès",
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
        variant: "destructive"
      })
    }
  }

  const handleDeleteClick = (user: Utilisateur) => {
    setDeletingUser(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    try {
      const { error } = await supabase
        .from('utilisateurs')
        .delete()
        .eq('id', deletingUser.id)

      if (error) {
        throw error
      }

      setUsers(prev => prev.filter(user => user.id !== deletingUser.id))
      setDeleteDialogOpen(false)
      setDeletingUser(null)

      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      })
    }
  }

  const UserForm = ({ isEdit }: { isEdit: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nom" className="text-right">
          Nom
        </Label>
        <Input
          id="nom"
          value={formData.nom}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="prenom" className="text-right">
          Prénom
        </Label>
        <Input
          id="prenom"
          value={formData.prenom}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="telephone" className="text-right">
          Téléphone
        </Label>
        <Input
          id="telephone"
          value={formData.telephone}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="role" className="text-right">
          Rôle
        </Label>
        <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Gestionnaire">Gestionnaire</SelectItem>
            <SelectItem value="Livreur">Livreur</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="statut" className="text-right">
          Statut
        </Label>
        <Select value={formData.statut} onValueChange={(value) => handleSelectChange('statut', value)}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Actif">Actif</SelectItem>
            <SelectItem value="Inactif">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="adresse" className="text-right">
          Adresse
        </Label>
        <Input
          id="adresse"
          value={formData.adresse}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="Adresse complète"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="ville" className="text-right">
          Ville
        </Label>
        <Input
          id="ville"
          value={formData.ville}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="Ville"
        />
      </div>
      {formData.role === 'Livreur' && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicule" className="text-right">
              Véhicule
            </Label>
            <Input
              id="vehicule"
              value={formData.vehicule}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Type de véhicule"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zone" className="text-right">
              Zone
            </Label>
            <Input
              id="zone"
              value={formData.zone}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Zone de livraison"
            />
          </div>
        </>
      )}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="mot_de_passe" className="text-right">
          {isEdit ? "Nouveau mot de passe" : "Mot de passe"}
        </Label>
        <Input
          id="mot_de_passe"
          type="password"
          value={formData.mot_de_passe}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder={isEdit ? "Laisser vide pour ne pas changer" : ""}
        />
      </div>
      {!isEdit && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="confirm_password" className="text-right">
            Confirmer
          </Label>
          <Input
            id="confirm_password"
            type="password"
            className="col-span-3"
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-2xl">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
          <Dialog open={isRolesOpen} onOpenChange={setIsRolesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Rôles et permissions
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Rôles et permissions</DialogTitle>
                <DialogDescription>
                  Aperçu des différents rôles et leurs permissions dans le système
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Admin</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Accès complet à toutes les fonctionnalités du système
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Gestion des utilisateurs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Configuration système</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Gestion des colis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Assignation des livreurs</span>
                    </div>
                  </div>
                </div>

                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Gestionnaire</h4>
                  <p className="text-sm text-muted-foreground mb-2">Gestion des colis, clients et entreprises</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Créer/éditer colis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Gestion des clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Générer bons de distribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>Configuration système</span>
                    </div>
                  </div>
                </div>

                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Livreur</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Accès limité aux bons de distribution et colis assignés
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Voir les bons assignés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Modifier statut des colis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>Gestion des clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>Créer nouveaux colis</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button onClick={() => setIsRolesOpen(false)}>Fermer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un nouvel utilisateur.
                </DialogDescription>
              </DialogHeader>
              <UserForm isEdit={false} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" onClick={handleAddUser}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
            <Button variant="outline" onClick={resetFilters} size="sm">
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
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:flex-1">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Gestionnaire">Gestionnaire</SelectItem>
                <SelectItem value="Livreur">Livreur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actifs seulement</SelectItem>
                <SelectItem value="Inactif">Inactifs seulement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription className="mt-0">
              Total: {totalCount} utilisateurs trouvés
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des utilisateurs...</span>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur trouvé"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => {
                  // Determine badge variant based on role
                  let badgeVariant = "secondary";
                  if (user.role === "Admin") badgeVariant = "destructive";
                  else if (user.role === "Gestionnaire") badgeVariant = "default";

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{`${user.nom} ${user.prenom}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telephone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.statut === "Actif" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"}`}>
                          {user.statut}
                        </span>
                      </TableCell>
                      <TableCell>{user.derniere_connexion ? new Date(user.derniere_connexion).toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(user)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              </Table>

              {/* Pagination */}
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <UserForm isEdit={true} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" onClick={handleUpdateUser}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              Supprimer l'utilisateur
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="py-4">
              <p className="text-sm">
                Vous êtes sur le point de supprimer l'utilisateur <strong>{deletingUser.nom} {deletingUser.prenom}</strong>.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
              {loading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
