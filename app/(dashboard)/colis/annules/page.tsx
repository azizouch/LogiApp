"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Search, Calendar, User, Building, X, Filter, UserCog } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export default function ColisAnnulesPage() {
  const [colisAnnules, setColisAnnules] = useState<any[]>([])
  const [filteredColis, setFilteredColis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedUtilisateur, setSelectedUtilisateur] = useState("all")
  const [selectedMotif, setSelectedMotif] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paginatedColis, setPaginatedColis] = useState<any[]>([])

  // Unique options for filters
  const [clients, setClients] = useState<string[]>([])
  const [utilisateurs, setUtilisateurs] = useState<string[]>([])
  const [motifs, setMotifs] = useState<string[]>([])

  useEffect(() => {
    const fetchColisAnnules = async () => {
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
            date_mise_a_jour,

            notes,
            historique:historique_colis(date, statut, utilisateur(id, nom, prenom, role))
          `)
          .or('statut.eq.Annulé,statut.eq.Annulé par Vendeur')
          .order('date_mise_a_jour', { ascending: false })

        if (error) {
          throw error
        }

        // Transform data for display
        const formattedColis = colisData.map(colis => {
          // Find the most recent historique entry for this colis
          const historiqueEntries = colis.historique || []
          const latestHistorique = historiqueEntries.length > 0
            ? historiqueEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            : null

          return {
            id: colis.id,
            client: colis.client ? colis.client.nom : 'Client inconnu',
            adresse: colis.client && colis.client.adresse ? colis.client.adresse + (colis.client.ville ? `, ${colis.client.ville}` : '') : 'Adresse inconnue',
            date_annulation: colis.date_mise_a_jour ? new Date(colis.date_mise_a_jour).toLocaleDateString('fr-FR') : 'Date inconnue',
            motif: colis.notes || 'Non spécifié',
            utilisateur: latestHistorique && latestHistorique.utilisateur
              ? latestHistorique.utilisateur.role || 'Utilisateur'
              : 'Système',
            // Keep original data for filtering
            raw: colis
          }
        })

        setColisAnnules(formattedColis)
        setFilteredColis(formattedColis)

        // Extract unique values for filters
        const uniqueClients = Array.from(new Set(formattedColis.map(colis => colis.client)))
        const uniqueUtilisateurs = Array.from(new Set(formattedColis.map(colis => colis.utilisateur)))
        const uniqueMotifs = Array.from(new Set(formattedColis.map(colis => colis.motif)))

        setClients(uniqueClients)
        setUtilisateurs(uniqueUtilisateurs)
        setMotifs(uniqueMotifs)
      } catch (error) {
        console.error('Error fetching cancelled colis:', JSON.stringify(error))
        // Set empty arrays to avoid undefined errors
        setColisAnnules([])
        setFilteredColis([])
        setClients([])
        setUtilisateurs([])
        setMotifs([])
      } finally {
        setLoading(false)
      }
    }

    fetchColisAnnules()
  }, [])

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...colisAnnules]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(colis =>
        colis.id.toLowerCase().includes(query) ||
        colis.client.toLowerCase().includes(query) ||
        colis.adresse.toLowerCase().includes(query) ||
        colis.utilisateur.toLowerCase().includes(query) ||
        colis.motif.toLowerCase().includes(query)
      )
    }

    // Apply client filter
    if (selectedClient && selectedClient !== "all") {
      filtered = filtered.filter(colis => colis.client === selectedClient)
    }

    // Apply utilisateur filter
    if (selectedUtilisateur && selectedUtilisateur !== "all") {
      filtered = filtered.filter(colis => colis.utilisateur === selectedUtilisateur)
    }

    // Apply motif filter
    if (selectedMotif && selectedMotif !== "all") {
      filtered = filtered.filter(colis => colis.motif === selectedMotif)
    }

    // Apply date filter
    if (selectedDate) {
      const dateString = selectedDate.toLocaleDateString('fr-FR')
      filtered = filtered.filter(colis => colis.date_annulation === dateString)
    }

    setFilteredColis(filtered)
    setTotalCount(filtered.length)

    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [colisAnnules, searchQuery, selectedClient, selectedUtilisateur, selectedMotif, selectedDate])

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
    setSelectedUtilisateur("all")
    setSelectedMotif("all")
    setSelectedDate(undefined)
  }

  // Get badge color based on utilisateur role
  const getUtilisateurBadgeColor = (utilisateur: string) => {
    switch (utilisateur) {
      case 'Admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'Gestionnaire':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Colis Annulés</h1>
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
              <Select value={selectedUtilisateur} onValueChange={setSelectedUtilisateur}>
                <SelectTrigger id="utilisateur">
                  <SelectValue placeholder="Tous les utilisateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  {utilisateurs.map(utilisateur => (
                    <SelectItem key={utilisateur} value={utilisateur}>{utilisateur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:flex-1">
              <Select value={selectedMotif} onValueChange={setSelectedMotif}>
                <SelectTrigger id="motif">
                  <SelectValue placeholder="Tous les motifs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les motifs</SelectItem>
                  {motifs.map(motif => (
                    <SelectItem key={motif} value={motif}>{motif}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:flex-1">
              <DatePicker
                id="date"
                selected={selectedDate}
                onSelect={setSelectedDate}
                placeholder="Date d'annulation"
              />
            </div>
          </div>
</div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-gray-500" />
              Liste des colis annulés
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
            <p className="text-center text-muted-foreground py-4">Aucun colis annulé trouvé</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">ID</th>
                    <th className="py-2 px-4 text-left">Client</th>
                    <th className="py-2 px-4 text-left">Adresse</th>
                    <th className="py-2 px-4 text-left">Date d'annulation</th>
                    <th className="py-2 px-4 text-left">Motif</th>
                    <th className="py-2 px-4 text-left">Utilisateur</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedColis.map((colis) => (
                    <tr key={colis.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{colis.id}</td>
                      <td className="py-2 px-4">{colis.client}</td>
                      <td className="py-2 px-4">{colis.adresse}</td>
                      <td className="py-2 px-4">{colis.date_annulation}</td>
                      <td className="py-2 px-4">{colis.motif}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          <UserCog className="mr-1 h-3 w-3" />
                          <Badge variant="outline" className={getUtilisateurBadgeColor(colis.utilisateur)}>
                            {colis.utilisateur}
                          </Badge>
                        </div>
                      </td>
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
