'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RotateCcw, Package } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { ColisCard } from "@/components/colis-card"

export default function ColisRelancePage() {
  const [colis, setColis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        if (!user || !user.id) {
          throw new Error("Utilisateur non connecté")
        }

        // Build query for relanced colis
        // Note: In a real implementation, you would have a field to identify relanced colis
        // For now, we're just simulating with a query that would get relanced colis
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
        .eq('statut', 'En attente') // Assuming relanced colis have a specific status or flag
        // You might add a specific condition for relanced colis here
        // .eq('is_relanced', true)

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
  }, [user])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Colis Relancé</h1>
            <p className="text-muted-foreground mt-2">
              Colis qui ont été relancés et qui sont en attente de livraison
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {loading ? "Chargement..." : `Total: ${colis.length} colis`}
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
          <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun colis relancé</h3>
          <p className="text-muted-foreground">
            Vous n'avez actuellement aucun colis relancé à livrer.
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
