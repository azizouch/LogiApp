'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageCheck, Search, Filter, X, Loader2, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { ColisCard } from "@/components/colis-card"

export default function LivreurColisLivresPage() {
  // State for data
  const [colis, setColis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("recent")

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
          client:client_id(id, nom, telephone),
          entreprise:entreprise_id(id, nom),
          prix,
          frais,
          statut,
          date_creation
        `)
        .eq('livreur_id', user.id)
        .eq('statut', 'Livré')

        if (searchQuery) {
          query = query.or(`id.ilike.%${searchQuery}%,client.nom.ilike.%${searchQuery}%,entreprise.nom.ilike.%${searchQuery}%`)
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
  }, [searchQuery, sortOption, user])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSortOption("recent")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Colis Livrés</h1>
            <p className="text-muted-foreground mt-2">
              Vos colis qui ont été livrés avec succès
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {loading ? "Chargement..." : `Total: ${colis.length} colis`}
          </div>
        </div>
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
          <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun colis livré</h3>
          <p className="text-muted-foreground">
            Vous n'avez actuellement aucun colis livré.
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
