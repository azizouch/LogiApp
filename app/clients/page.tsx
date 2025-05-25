"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Search, Phone, Mail, MapPin, Loader2, Filter, X } from "lucide-react"
import { fetchClients, Client } from "@/lib/api"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [villeFilter, setVilleFilter] = useState("all")
  const [entrepriseFilter, setEntrepriseFilter] = useState("all")
  const [totalCount, setTotalCount] = useState(0)

  // Available filter options
  const [availableVilles, setAvailableVilles] = useState<string[]>([])
  const [availableEntreprises, setAvailableEntreprises] = useState<string[]>([])
  const [allClients, setAllClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Load all clients initially
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const result = await fetchClients(undefined, 1, 1000) // Get all clients
        setAllClients(result.data)

        // Extract unique values for filters
        const villes = Array.from(new Set(result.data.map(client => client.ville).filter(Boolean)))
        const entreprises = Array.from(new Set(result.data.map(client => client.entreprise).filter(Boolean)))

        setAvailableVilles(villes)
        setAvailableEntreprises(entreprises)
        setError(null)
      } catch (err: any) {
        console.error("Error loading clients:", err)
        setError(err.message || "Une erreur est survenue lors du chargement des clients")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...allClients]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(client =>
        client.nom.toLowerCase().includes(query) ||
        client.telephone?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.adresse?.toLowerCase().includes(query)
      )
    }

    // Apply ville filter
    if (villeFilter && villeFilter !== "all") {
      filtered = filtered.filter(client => client.ville === villeFilter)
    }

    // Apply entreprise filter
    if (entrepriseFilter && entrepriseFilter !== "all") {
      filtered = filtered.filter(client => client.entreprise === entrepriseFilter)
    }

    setFilteredClients(filtered)
    setTotalCount(filtered.length)

    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [allClients, searchQuery, villeFilter, entrepriseFilter])

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setClients(filteredClients.slice(startIndex, endIndex))
  }, [filteredClients, currentPage, pageSize])

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('')
    setVilleFilter('all')
    setEntrepriseFilter('all')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold sm:text-2xl">Gestion des Clients</h1>
        <Button asChild>
          <Link href="/clients/nouveau">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Client
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          {(searchQuery || villeFilter !== "all" || entrepriseFilter !== "all") && (
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:flex-1">
            <Select value={villeFilter} onValueChange={setVilleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les villes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {availableVilles.map(ville => (
                  <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={entrepriseFilter} onValueChange={setEntrepriseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les entreprises" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entreprises</SelectItem>
                {availableEntreprises.map(entreprise => (
                  <SelectItem key={entreprise} value={entreprise}>{entreprise}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des Clients</CardTitle>
            <CardDescription className="mt-0">
              {loading ? "Chargement..." : `Total: ${totalCount} clients enregistrés`}
            </CardDescription>
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Adresse</TableHead>
                    <TableHead className="hidden md:table-cell">Entreprise</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucun client trouvé avec les filtres actuels
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            {client.nom}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                              {client.telephone}
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                              {client.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {client.adresse}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{client.entreprise || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/clients/${client.id}`}>Détails</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {clients.length > 0 && (
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
