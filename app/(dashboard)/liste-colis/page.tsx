"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Loader2, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

// Import the status context
import { useStatus } from "@/contexts/status-context"

// Status badge component
function StatusBadge({ status }: { status: string }) {
  // Use the getStatusColor function from the context
  const { getStatusColor } = useStatus()

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {status}
    </Badge>
  )
}

export default function ListeColisPage() {
  // State for data
  const [colis, setColis] = useState<any[]>([])
  const [livreurs, setLivreurs] = useState<any[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [livreurFilter, setLivreurFilter] = useState("all")
  const [sortOption, setSortOption] = useState("recent")

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Helper function to get status by ID
  const getStatusById = (statusId: string) => {
    return statuses.find(s => s.id === statusId)?.nom || ''
  }

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Fetch livreurs for the dropdown
        const { data: livreursData, error: livreursError } = await supabase
          .from('utilisateurs')
          .select('id, nom, prenom')
          .eq('role', 'Livreur')

        if (livreursError) throw livreursError
        setLivreurs(livreursData || [])

        // Fetch statuses for the dropdown
        const { data: statusesData, error: statusesError } = await supabase
          .from('statuts')
          .select('id, nom, couleur')
          .eq('actif', true)
          .order('ordre', { ascending: true })

        if (statusesError) throw statusesError
        setStatuses(statusesData || [])

        // Build base query for count and data
        let baseQuery = supabase.from('colis')

        // Apply filters
        if (statusFilter !== "all") {
          const statusName = getStatusById(statusFilter)
          if (statusName) {
            baseQuery = baseQuery.eq('statut', statusName)
          }
        }

        if (livreurFilter !== "all") {
          baseQuery = baseQuery.eq('livreur_id', livreurFilter)
        }

        if (searchQuery) {
          baseQuery = baseQuery.or(`id.ilike.%${searchQuery}%,client_id.ilike.%${searchQuery}%,entreprise_id.ilike.%${searchQuery}%`)
        }

        // Get total count first
        const { count, error: countError } = await baseQuery
          .select('id', { count: 'exact', head: true })

        if (countError) throw countError
        setTotalCount(count || 0)

        // Now get paginated data
        let dataQuery = supabase.from('colis').select(`
          id,
          client:client_id(id, nom),
          entreprise:entreprise_id(id, nom),
          livreur:livreur_id(id, nom, prenom),
          statut,
          date_creation
        `)

        // Apply the same filters
        if (statusFilter !== "all") {
          const statusName = getStatusById(statusFilter)
          if (statusName) {
            dataQuery = dataQuery.eq('statut', statusName)
          }
        }

        if (livreurFilter !== "all") {
          dataQuery = dataQuery.eq('livreur_id', livreurFilter)
        }

        if (searchQuery) {
          dataQuery = dataQuery.or(`id.ilike.%${searchQuery}%,client.nom.ilike.%${searchQuery}%,entreprise.nom.ilike.%${searchQuery}%`)
        }

        // Apply sorting
        switch (sortOption) {
          case 'recent':
            dataQuery = dataQuery.order('date_creation', { ascending: false })
            break
          case 'ancien':
            dataQuery = dataQuery.order('date_creation', { ascending: true })
            break
          case 'client':
            dataQuery = dataQuery.order('client(nom)', { ascending: true })
            break
        }

        // Apply pagination
        const from = (currentPage - 1) * pageSize
        const to = from + pageSize - 1

        dataQuery = dataQuery.range(from, to)

        const { data: colisData, error: colisError } = await dataQuery

        if (colisError) throw colisError

        // Format the data
        const formattedColis = (colisData || []).map(item => ({
          id: item.id,
          client: item.client?.nom || 'N/A',
          entreprise: item.entreprise?.nom || 'N/A',
          livreur: item.livreur ? `${item.livreur.prenom} ${item.livreur.nom}` : 'Non assigné',
          statut: item.statut,
          dateCreation: item.date_creation
        }))

        setColis(formattedColis)
        setError(null)
      } catch (err: any) {
        console.error("Error loading data:", err)
        setError(err.message ?? "Une erreur est survenue lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchQuery, statusFilter, livreurFilter, sortOption, currentPage, pageSize])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setLivreurFilter("all")
    setSortOption("recent")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Liste des Colis</h1>
        <Button asChild>
          <Link href="/colis/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un colis
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          <Button variant="outline" onClick={resetFilters} size="sm">
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:flex md:flex-wrap gap-4 items-end">
          <div className="w-full md:flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={livreurFilter} onValueChange={setLivreurFilter}>
              <SelectTrigger id="livreur">
                <SelectValue placeholder="Livreur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les livreurs</SelectItem>
                {livreurs.map(livreur => (
                  <SelectItem key={livreur.id} value={livreur.id}>
                    {livreur.prenom} {livreur.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="ancien">Plus ancien</SelectItem>
                <SelectItem value="client">Client (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des Colis</CardTitle>
            <div className="text-sm text-muted-foreground">
              {loading ? "Chargement..." : `Total: ${colis.length} colis trouvés`}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 text-red-800 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des données...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Colis</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Entreprise</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Date de création</TableHead>
                    <TableHead className="hidden md:table-cell">Livreur</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun colis trouvé avec les filtres actuels
                      </TableCell>
                    </TableRow>
                  ) : (
                    colis.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            {item.id}
                          </div>
                        </TableCell>
                        <TableCell>{item.client}</TableCell>
                        <TableCell className="hidden md:table-cell">{item.entreprise}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.statut} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.dateCreation ?
                            new Date(item.dateCreation)
                              .toLocaleDateString("fr-FR")
                              .replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2)
                            : ""}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{item.livreur}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/colis/${item.id}`}>
                              Voir
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
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
    </div>
  )
}
