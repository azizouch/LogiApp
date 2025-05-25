'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Package, Search, Loader2, Filter, X, Calendar } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { useStatus } from "@/contexts/status-context"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { ColisCard } from "@/components/colis-card"

export default function MesColisPage() {
  // State for data
  const [colis, setColis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { statuses } = useStatus()

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOption, setSortOption] = useState("recent")
  const [dateRange, setDateRange] = useState("all")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false)

  // Helper function to get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en-attente': return 'En attente'
      case 'en-cours': return 'En cours'
      case 'livre': return 'Livré'
      case 'refuse': return 'Refusé'
      case 'annule': return 'Annulé'
      default: return status
    }
  }

  // Helper function to get date range
  const getDateRange = () => {
    const today = new Date()

    switch (dateRange) {
      case 'today':
        return {
          start: startOfDay(today),
          end: endOfDay(today)
        }
      case 'yesterday':
        const yesterday = subDays(today, 1)
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        }
      case 'last7days':
        return {
          start: startOfDay(subDays(today, 6)),
          end: endOfDay(today)
        }
      case 'last30days':
        return {
          start: startOfDay(subDays(today, 29)),
          end: endOfDay(today)
        }
      case 'thisMonth':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        }
      case 'lastMonth':
        const lastMonth = subMonths(today, 1)
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        }
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : null,
          end: customEndDate ? new Date(customEndDate) : null
        }
      default:
        return {
          start: null,
          end: null
        }
    }
  }

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        if (!user || !user.id) {
          throw new Error("Utilisateur non connecté")
        }

        // Build query for colis
        let query = supabase.from('colis').select(`
          id,
          client:client_id(id, nom, telephone, adresse, ville),
          entreprise:entreprise_id(id, nom),
          prix,
          frais,
          statut,
          date_creation
        `)
        .eq('livreur_id', user.id)

        // Apply filters
        if (statusFilter !== "all") {
          query = query.eq('statut', getStatusLabel(statusFilter))
        }

        if (searchQuery) {
          query = query.or(`id.ilike.%${searchQuery}%,client.nom.ilike.%${searchQuery}%,entreprise.nom.ilike.%${searchQuery}%`)
        }

        // Apply date filter
        if (dateRange !== 'all') {
          const { start, end } = getDateRange()
          if (start && end) {
            query = query.gte('date_creation', start.toISOString())
                         .lte('date_creation', end.toISOString())
          }
        }

        // Apply sorting
        switch (sortOption) {
          case 'recent':
            query = query.order('date_creation', { ascending: false })
            break
          case 'ancien':
            query = query.order('date_creation', { ascending: true })
            break
          case 'client':
            query = query.order('client(nom)', { ascending: true })
            break
        }

        const { data: colisData, error: colisError } = await query

        if (colisError) {
          console.error("Supabase error:", colisError)
          throw new Error(colisError.message || "Erreur lors de la récupération des données")
        }

        // Format the data
        const formattedColis = (colisData || []).map(item => ({
          id: item.id,
          clientName: item.client?.nom ?? 'N/A',
          clientPhone: item.client?.telephone ?? '',
          clientAddress: item.client?.adresse ?? '',
          clientCity: item.client?.ville ?? '',
          entrepriseName: item.entreprise?.nom ?? 'N/A',
          amount: item.prix ?? 0,
          frais: item.frais ?? 0,
          status: item.statut,
          date: item.date_creation
        }))

        setColis(formattedColis)
        setError(null)
      } catch (err: any) {
        console.error("Error loading data:", err)
        // Make sure we always have a string message
        const errorMessage = typeof err === 'string'
          ? err
          : err?.message ?? "Une erreur est survenue lors du chargement des données"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchQuery, statusFilter, sortOption, dateRange, customStartDate, customEndDate, user])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSortOption("recent")
    setDateRange("all")
    setCustomStartDate("")
    setCustomEndDate("")
    setShowCustomDateInputs(false)
  }

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    setShowCustomDateInputs(value === 'custom')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold sm:text-2xl">Mes Colis</h1>
        <div className="text-sm text-muted-foreground">
          {loading ? "Chargement..." : `Total: ${colis.length} colis trouvés`}
        </div>
      </div>

      <div className="mb-6">
  <div className="flex items-center justify-between mb-4">
    <div className="text-lg font-medium flex items-center">
      <Filter className="mr-2 h-5 w-5" />
      Filtres
    </div>
    {(searchQuery || statusFilter !== "all" || sortOption !== "recent" || dateRange !== "all") && (
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
                  {statuses && statuses.length > 0 ? (
                    statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.nom}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback options if statuses aren't loaded
                    <>
                      <SelectItem value="en-attente">En attente</SelectItem>
                      <SelectItem value="en-cours">En cours</SelectItem>
                      <SelectItem value="livre">Livré</SelectItem>
                      <SelectItem value="refuse">Refusé</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </>
                  )}
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

            <div className="w-full md:flex-1">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger id="dateRange" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="yesterday">Hier</SelectItem>
                  <SelectItem value="last7days">7 derniers jours</SelectItem>
                  <SelectItem value="last30days">30 derniers jours</SelectItem>
                  <SelectItem value="thisMonth">Ce mois</SelectItem>
                  <SelectItem value="lastMonth">Le mois dernier</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showCustomDateInputs && (
              <div className="w-full flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="startDate" className="text-xs text-muted-foreground mb-1 block">
                    Date de début
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="endDate" className="text-xs text-muted-foreground mb-1 block">
                    Date de fin
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
</div>

      {error && (
        <div className="mb-6 p-4 text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8 bg-white rounded-lg shadow-sm border p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      ) : colis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border p-6">
          <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun colis trouvé</h3>
          <p className="text-muted-foreground">
            Aucun colis ne correspond aux filtres actuels
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {colis.map((item) => (
            <ColisCard
              key={item.id}
              id={item.id}
              clientName={item.clientName}
              clientPhone={item.clientPhone}
              clientAddress={item.clientAddress}
              clientCity={item.clientCity}
              entrepriseName={item.entrepriseName}
              amount={item.amount}
              frais={item.frais}
              status={item.status}
              date={item.date}
            />
          ))}
        </div>
      )}
    </div>
  )
}
