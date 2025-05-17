"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { AlertCircle, CheckCircle, Database, Copy, ExternalLink } from "lucide-react"
import { useStatus } from "@/contexts/status-context"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SetupStatusesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { refreshStatuses } = useStatus()
  const router = useRouter()

  // SQL script to create the statuses table
  const createTableSQL = `
    -- Create statuses table if it doesn't exist
    CREATE TABLE IF NOT EXISTS statuses (
        id VARCHAR(50) PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        couleur VARCHAR(50),
        ordre INT,
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insert default statuses if they don't exist
    INSERT INTO statuses (id, nom, couleur, ordre, actif)
    VALUES
        ('en-attente', 'En attente', 'blue', 1, TRUE),
        ('pris-en-charge', 'Pris en charge', 'orange', 2, TRUE),
        ('en-cours-livraison', 'En cours de livraison', 'yellow', 3, TRUE),
        ('livre', 'Livré', 'green', 4, TRUE),
        ('refuse', 'Refusé', 'red', 5, TRUE),
        ('annule', 'Annulé', 'gray', 6, TRUE)
    ON CONFLICT (id) DO NOTHING;
  `

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createTableSQL)
    toast({
      title: "Copié !",
      description: "Le script SQL a été copié dans le presse-papiers",
    })
  }

  const checkTableExists = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to select from the statuses table
      const { data, error } = await supabase
        .from('statuses')
        .select('id')
        .limit(1)

      if (error) {
        // Table doesn't exist
        setError("La table des statuts n'existe pas encore. Veuillez exécuter le script SQL.")
        return false
      }

      // Table exists
      setSuccess(true)

      // Refresh statuses in context
      await refreshStatuses()

      // Redirect to the statuses page after 2 seconds
      setTimeout(() => {
        router.push('/admin/parametres/statuts')
      }, 2000)

      return true
    } catch (err: any) {
      console.error("Error checking statuses table:", err)
      setError(err.message || "Une erreur s'est produite lors de la vérification de la table des statuts")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Check if table exists on component mount
  useEffect(() => {
    checkTableExists()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuration des Statuts
          </CardTitle>
          <CardDescription>
            Créez la table des statuts dans votre base de données Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pour utiliser la gestion des statuts, vous devez créer la table <code>statuses</code> dans votre base de données Supabase.
            Suivez les instructions ci-dessous pour configurer cette table.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Table non configurée</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>
                La table des statuts existe et est correctement configurée. Vous allez être redirigé vers la page de gestion des statuts.
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
                <h3 className="text-lg font-medium">Comment configurer la table des statuts :</h3>

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
                    <p>Revenez à cette page et cliquez sur <strong>Vérifier la configuration</strong> pour confirmer que la table a été créée</p>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
                <p className="font-medium mb-2">Important :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Assurez-vous que votre utilisateur Supabase a les droits nécessaires pour créer des tables.</li>
                  <li>Cette opération est sans danger si la table existe déjà.</li>
                  <li>Les statuts par défaut seront ajoutés uniquement s'ils n'existent pas déjà.</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="script" className="mt-4">
              <div className="bg-gray-950 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">{createTableSQL}</pre>
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
            onClick={() => router.push('/admin/parametres/statuts')}
          >
            Retour
          </Button>

          <Button
            onClick={checkTableExists}
            disabled={loading || success}
          >
            {loading ? 'Vérification...' : 'Vérifier la configuration'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
