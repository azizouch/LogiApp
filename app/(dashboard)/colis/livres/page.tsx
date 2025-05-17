"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageCheck, Search, Calendar, User, Building, X, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export default function ColisLivresPage() {
  const [colisLivres, setColisLivres] = useState<any[]>([])
  const [filteredColis, setFilteredColis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedLivreur, setSelectedLivreur] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paginatedColis, setPaginatedColis] = useState<any[]>([])

  // Unique options for filters
  const [clients, setClients] = useState<string[]>([])
  const [livreurs, setLivreurs] = useState<string[]>([])

  useEffect(() => {
    const fetchColisLivres = async () => {
      try {
        setLoading(true)

        // Fetch real data from Supabase
        const { data: colisData, error } = await supabase
          .from('colis')
          .select(`
            id,
            client:client_id(id, nom, telephone, adresse, ville),
            entreprise:entreprise_id(id, nom),
            livreur:livreur_id(id, nom, prenom),
            statut,
            date_creation,
            date_mise_a_jour
          `)
          .eq('statut', 'Livré')
          .order('date_mise_a_jour', { ascending: false })

        if (error) {
          throw error
        }

        // Transform data for display
        const formattedColis = colisData.map(colis => ({
          id: colis.id,
          client: colis.client ? colis.client.nom : 'Client inconnu',
          adresse: colis.client && colis.client.adresse ? colis.client.adresse + (colis.client.ville ? `, ${colis.client.ville}` : '') : 'Adresse inconnue',
          date_livraison: colis.date_mise_a_jour ? new Date(colis.date_mise_a_jour).toLocaleDateString('fr-FR') : 'Date inconnue',
          livreur: colis.livreur ? `${colis.livreur.prenom} ${colis.livreur.nom}` : 'Non assigné',
          // Keep original data for filtering
          raw: colis
        }))

        setColisLivres(formattedColis)
        setFilteredColis(formattedColis)

        // Extract unique clients and livreurs for filters
        const uniqueClients = Array.from(new Set(formattedColis.map(colis => colis.client)))
        const uniqueLivreurs = Array.from(new Set(formattedColis.map(colis => colis.livreur)))

        setClients(uniqueClients)
        setLivreurs(uniqueLivreurs)
      } catch (error) {
        console.error('Error fetching delivered colis:', JSON.stringify(error))
        // Set empty arrays to avoid undefined errors
        setColisLivres([])
        setFilteredColis([])
        setClients([])
        setLivreurs([])
      } finally {
        setLoading(false)
      }
    }

    fetchColisLivres()
  }, [])

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...colisLivres]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(colis =>
        colis.id.toLowerCase().includes(query) ||
        colis.client.toLowerCase().includes(query) ||
        colis.adresse.toLowerCase().includes(query) ||
        colis.livreur.toLowerCase().includes(query)
      )
    }

    // Apply client filter
    if (selectedClient && selectedClient !== "all") {
      filtered = filtered.filter(colis => colis.client === selectedClient)
    }

    // Apply livreur filter
    if (selectedLivreur && selectedLivreur !== "all") {
      filtered = filtered.filter(colis => colis.livreur === selectedLivreur)
    }

    // Apply date filter
    if (selectedDate) {
      const dateString = selectedDate.toLocaleDateString('fr-FR')
      filtered = filtered.filter(colis => colis.date_livraison === dateString)
    }

    setFilteredColis(filtered)
    setTotalCount(filtered.length)

    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [colisLivres, searchQuery, selectedClient, selectedLivreur, selectedDate])

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setPaginatedColis(filteredColis.slice(startIndex, endIndex))
  }, [filteredColis, currentPage, pageSize])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedClient("all")
    setSelectedLivreur("all")
    setSelectedDate(undefined)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Colis Livrés</h1>
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
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client} value={client}>{client}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={selectedLivreur} onValueChange={setSelectedLivreur}>
              <SelectTrigger id="livreur">
                <SelectValue placeholder="Tous les livreurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les livreurs</SelectItem>
                {livreurs.map(livreur => (
                  <SelectItem key={livreur} value={livreur}>{livreur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <DatePicker
              id="date"
              selected={selectedDate}
              onSelect={setSelectedDate}
              placeholder="Date de livraison"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <PackageCheck className="mr-2 h-5 w-5 text-green-500" />
              Liste des colis livrés
            </div>
            <div className="text-sm text-muted-foreground">
              {totalCount} résultat{totalCount !== 1 ? 's' : ''}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : totalCount === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucun colis livré trouvé</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">ID</th>
                    <th className="py-2 px-4 text-left">Client</th>
                    <th className="py-2 px-4 text-left">Adresse</th>
                    <th className="py-2 px-4 text-left">Date de livraison</th>
                    <th className="py-2 px-4 text-left">Livreur</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedColis.map((colis) => (
                    <tr key={colis.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{colis.id}</td>
                      <td className="py-2 px-4">{colis.client}</td>
                      <td className="py-2 px-4">{colis.adresse}</td>
                      <td className="py-2 px-4">{colis.date_livraison}</td>
                      <td className="py-2 px-4">{colis.livreur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
