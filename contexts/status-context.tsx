"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface Status {
  id: string
  nom: string
  couleur?: string
  ordre?: number
  actif: boolean
  type?: string
}

interface StatusContextType {
  statuses: Status[]
  loading: boolean
  error: string | null
  refreshStatuses: (fetchAll?: boolean) => Promise<void>
  getStatusColor: (statusName: string) => string
}

const StatusContext = createContext<StatusContextType | undefined>(undefined)

export function StatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch statuses with a filter option to get all statuses or only active ones
  const fetchStatuses = async (fetchAll = false) => {
    try {
      setLoading(true)
      setError(null)

      // Default statuses to use as fallback
      const defaultStatuses = [
        { id: 'en-attente', nom: 'En attente', couleur: 'blue', ordre: 1, actif: true, type: 'colis' },
        { id: 'pris-en-charge', nom: 'Pris en charge', couleur: 'orange', ordre: 2, actif: true, type: 'colis' },
        { id: 'en-cours-livraison', nom: 'En cours de livraison', couleur: 'yellow', ordre: 3, actif: true, type: 'colis' },
        { id: 'livre', nom: 'Livré', couleur: 'green', ordre: 4, actif: true, type: 'colis' },
        { id: 'refuse', nom: 'Refusé', couleur: 'red', ordre: 5, actif: true, type: 'colis' },
        { id: 'annule', nom: 'Annulé', couleur: 'gray', ordre: 6, actif: true, type: 'colis' }
      ]

      // Build the query based on whether we want all statuses or just active ones
      let query = supabase
        .from('statuts')
        .select('*')
        .order('ordre')

      // Only filter by active status if we're not fetching all statuses
      if (!fetchAll) {
        query = query.eq('actif', true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error("Error fetching statuses:", fetchError)

        // Use fallback statuses regardless of error
        setStatuses(defaultStatuses)

        // Set a generic error message if we can't determine the specific error
        setError("Impossible de charger les statuts depuis la base de données. Utilisation des statuts par défaut.")

        return
      }

      // If we got data, use it, otherwise use fallback
      if (data && data.length > 0) {
        setStatuses(data)
      } else {
        console.log("No statuses found in database, using defaults")
        setStatuses(defaultStatuses)
      }
    } catch (err: any) {
      console.error('Error fetching statuses:', err)

      // Set a generic error message
      setError("Impossible de charger les statuts depuis la base de données. Utilisation des statuts par défaut.")

      // Fallback to default statuses if there's an error
      setStatuses(defaultStatuses)
    } finally {
      setLoading(false)
    }
  }

  // Function to get status color based on status name
  const getStatusColor = (statusName: string) => {
    // First try to find an exact match
    const status = statuses.find(s => s.nom.toLowerCase() === statusName.toLowerCase())

    // If we found a status with a color, use that
    if (status && status.couleur) {
      const color = status.couleur.toLowerCase()

      // Return our custom CSS classes based on the color
      // For backward compatibility, handle text-only variants
      if (color.endsWith('-text')) {
        // Extract the base color name
        const baseColor = color.replace('-text', '')
        return `status-${baseColor}`
      }

      // All variants now use the outline style
      switch (color) {
        case 'blue':
          return 'status-blue'
        case 'green':
          return 'status-green'
        case 'red':
          return 'status-red'
        case 'yellow':
          return 'status-yellow'
        case 'orange':
          return 'status-orange'
        case 'purple':
          return 'status-purple'
        case 'pink':
          return 'status-pink'
        case 'gray':
          return 'status-gray'
        case 'teal':
          return 'status-teal'
        case 'indigo':
          return 'status-indigo'
        case 'lime':
          return 'status-lime'
        case 'cyan':
          return 'status-cyan'
        case 'amber':
          return 'status-amber'
        default:
          return 'status-gray'
      }
    }

    // If we didn't find a status or it doesn't have a color, use a fallback based on the name
    const statusNameLower = statusName.toLowerCase()

    // All statuses now use the outline style
    if (statusNameLower.includes('attente')) {
      return 'status-blue'
    } else if (statusNameLower.includes('cours') || statusNameLower.includes('livraison')) {
      return 'status-yellow'
    } else if (statusNameLower.includes('livré')) {
      return 'status-green'
    } else if (statusNameLower.includes('refusé')) {
      return 'status-red'
    } else if (statusNameLower.includes('annulé')) {
      return 'status-gray'
    } else if (statusNameLower.includes('pris') || statusNameLower.includes('charge')) {
      return 'status-orange'
    } else if (statusNameLower.includes('relancé')) {
      return 'status-purple'
    } else if (statusNameLower.includes('retour')) {
      return 'status-indigo'
    } else if (statusNameLower.includes('reporté')) {
      return 'status-teal'
    } else if (statusNameLower.includes('urgent')) {
      return 'status-amber'
    }

    // Default fallback
    return 'status-gray'
  }

  useEffect(() => {
    fetchStatuses()
  }, [])

  const refreshStatuses = async (fetchAll = false) => {
    await fetchStatuses(fetchAll)
  }

  return (
    <StatusContext.Provider value={{
      statuses,
      loading,
      error,
      refreshStatuses,
      getStatusColor
    }}>
      {children}
    </StatusContext.Provider>
  )
}

export function useStatus() {
  const context = useContext(StatusContext)
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider')
  }
  return context
}
