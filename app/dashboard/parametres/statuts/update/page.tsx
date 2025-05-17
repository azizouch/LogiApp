"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { AlertCircle, CheckCircle, Database, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { useStatus } from "@/contexts/status-context"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UpdateStatusesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { refreshStatuses } = useStatus()
  const router = useRouter()

  // SQL script to update the statuses table
  const updateTableSQL = `-- Add couleur column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'statuses' 
        AND column_name = 'couleur'
    ) THEN
        ALTER TABLE statuses ADD COLUMN couleur VARCHAR(50) DEFAULT 'blue';
    END IF;
END $$;

-- Add ordre column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'statuses' 
        AND column_name = 'ordre'
    ) THEN
        ALTER TABLE statuses ADD COLUMN ordre INT;
        
        -- Update ordre values based on existing records
        WITH ordered_statuses AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
            FROM statuses
        )
        UPDATE statuses s
        SET ordre = os.row_num
        FROM ordered_statuses os
        WHERE s.id = os.id;
    END IF;
END $$;

-- Add actif column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'statuses' 
        AND column_name = 'actif'
    ) THEN
        ALTER TABLE statuses ADD COLUMN actif BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Set default colors for existing statuses if couleur is null
UPDATE statuses
SET couleur = CASE 
    WHEN id LIKE '%attente%' THEN 'blue'
    WHEN id LIKE '%pris%' OR id LIKE '%charge%' THEN 'orange'
    WHEN id LIKE '%cours%' OR id LIKE '%livraison%' THEN 'yellow'
    WHEN id LIKE '%livre%' THEN 'green'
    WHEN id LIKE '%refuse%' THEN 'red'
    WHEN id LIKE '%annule%' THEN 'gray'
    ELSE 'blue'
END
WHERE couleur IS NULL;`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(updateTableSQL)
    toast({
      title: "Copié !",
      description: "Le script SQL a été copié dans le presse-papiers",
    })
  }

  const checkTableStructure = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if the table has the required columns
      const { data, error } = await supabase
        .from('statuses')
        .select('id, couleur, ordre, actif')
        .limit(1)
      
      if (error) {
        setError("Erreur lors de la vérification de la structure de la table: " + error.message)
        return false
      }
      
      // Check if all columns exist
      const firstRow = data && data[0] ? data[0] : null
      if (!firstRow) {
        setError("La table des statuts est vide. Veuillez d'abord ajouter des statuts.")
        return false
      }
      
      const missingColumns = []
      if (!('couleur' in firstRow)) missingColumns.push('couleur')
      if (!('ordre' in firstRow)) missingColumns.push('ordre')
      if (!('actif' in firstRow)) missingColumns.push('actif')
      
      if (missingColumns.length > 0) {
        setError(`Colonnes manquantes dans la table: ${missingColumns.join(', ')}. Veuillez exécuter le script SQL.`)
        return false
      }
      
      // Table structure is correct
      setSuccess(true)
      
      // Refresh statuses in context
      await refreshStatuses()
      
      // Redirect to the statuses page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/parametres/statuts')
      }, 2000)
      
      return true
    } catch (err: any) {
      console.error("Error checking table structure:", err)
      setError(err.message || "Une erreur s'est produite lors de la vérification de la structure de la table")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Check table structure on component mount
  useEffect(() => {
    checkTableStructure()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Mise à jour de la table des statuts
          </CardTitle>
          <CardDescription>
            Ajoutez les colonnes manquantes à la table des statuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pour utiliser toutes les fonctionnalités de gestion des statuts, vous devez ajouter les colonnes <code>couleur</code>, <code>ordre</code> et <code>actif</code> à la table <code>statuses</code>.
            Suivez les instructions ci-dessous pour mettre à jour la structure de la table.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Structure de table incomplète</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>
                La structure de la table des statuts est correcte. Vous allez être redirigé vers la page de gestion des statuts.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="manual" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Instructions manuelles</TabsTrigger>
              <TabsTrigger value="script">Script SQL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-4 space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Comment mettre à jour la table des statuts :</h3>
                
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    <p>Connectez-vous à votre <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">compte Supabase</a></p>
                  </li>
                  <li>
                    <p>Sélectionnez votre projet (URL: <code>https://tdzgsjxdivbsnhqknbnd.supabase.co</code>)</p>
                  </li>
                  <li>
                    <p>Dans le menu de gauche, cliquez sur <strong>SQL Editor</strong></p>
                  </li>
                  <li>
                    <p>Cliquez sur <strong>New Query</strong> pour créer une nouvelle requête SQL</p>
                  </li>
                  <li>
                    <p>Copiez et collez le script SQL de l'onglet "Script SQL" dans l'éditeur</p>
                  </li>
                  <li>
                    <p>Cliquez sur le bouton <strong>Run</strong> pour exécuter la requête</p>
                  </li>
                  <li>
                    <p>Revenez à cette page et cliquez sur <strong>Vérifier la structure</strong> pour confirmer que la table a été mise à jour</p>
                  </li>
                </ol>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
                <p className="font-medium mb-2">Important :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ce script est conçu pour être exécuté en toute sécurité, même si les colonnes existent déjà.</li>
                  <li>Les colonnes seront ajoutées uniquement si elles n'existent pas.</li>
                  <li>Les valeurs par défaut seront attribuées aux colonnes nouvellement ajoutées.</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="script" className="mt-4">
              <div className="bg-gray-950 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">{updateTableSQL}</pre>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copier le script
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/parametres/statuts')}
          >
            Retour
          </Button>
          
          <Button 
            onClick={checkTableStructure} 
            disabled={loading || success}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Vérifier la structure
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
