'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Database, Check, AlertCircle } from 'lucide-react'

export default function DbUpdatePage() {
  const [sql, setSql] = useState(`-- Add prix and frais columns to colis table
ALTER TABLE colis 
ADD COLUMN IF NOT EXISTS prix DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS frais DECIMAL(10, 2) DEFAULT 0;

-- Update existing records with default values
UPDATE colis SET prix = 0, frais = 0 WHERE prix IS NULL OR frais IS NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN colis.prix IS 'Prix du colis (montant à payer par le client)';
COMMENT ON COLUMN colis.frais IS 'Frais de livraison';`)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const executeSQL = async () => {
    if (!sql.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une requête SQL",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/db/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      setResult(data)
      toast({
        title: "Succès",
        description: "La requête SQL a été exécutée avec succès",
      })
    } catch (err: any) {
      console.error('Error executing SQL:', err)
      setError(err.message || 'Une erreur est survenue')
      toast({
        title: "Erreur",
        description: err.message || 'Une erreur est survenue lors de l\'exécution de la requête SQL',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mise à jour de la base de données</h1>
        <p className="text-muted-foreground mt-2">
          Exécutez des requêtes SQL pour mettre à jour la structure de la base de données
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Exécuter une requête SQL
          </CardTitle>
          <CardDescription>
            Ajout des colonnes prix et frais à la table colis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Entrez votre requête SQL ici..."
            className="font-mono h-64"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {error && (
              <div className="text-red-500 flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </div>
            )}
            {result && (
              <div className="text-green-500 flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Requête exécutée avec succès
              </div>
            )}
          </div>
          <Button onClick={executeSQL} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exécution...
              </>
            ) : (
              'Exécuter'
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Résultat</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
