import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function ParametresPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">Configurez les paramètres de votre système de gestion logistique</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="statuts">Statuts</TabsTrigger>
          <TabsTrigger value="numerotation">Numérotation</TabsTrigger>
          <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
                <CardDescription>
                  Ces informations apparaîtront sur les bons de distribution et autres documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nom de l'entreprise</Label>
                  <Input id="company-name" defaultValue="LogiTrack" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address">Adresse</Label>
                  <Input id="company-address" defaultValue="123 Rue de la Logistique" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-city">Ville</Label>
                  <Input id="company-city" defaultValue="75001 Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Téléphone</Label>
                  <Input id="company-phone" defaultValue="01 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" defaultValue="contact@logitrack.fr" />
                </div>
                <Button className="mt-4">Enregistrer</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences système</CardTitle>
                <CardDescription>Configurez les préférences générales du système</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des notifications par email lors des changements de statut
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Signature électronique</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la signature électronique pour les bons de distribution
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Historique des statuts</Label>
                    <p className="text-sm text-muted-foreground">Conserver l'historique des changements de statut</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="mt-4">Enregistrer</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statuts">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des statuts</CardTitle>
              <CardDescription>
                Personnalisez les statuts disponibles pour les colis et les bons de distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Statuts des colis</h3>
                  <div className="space-y-2">
                    {["En attente", "Pris en charge", "En cours de livraison", "Livré", "Retourné"].map(
                      (status, index) => (
                        <div key={index} className="flex items-center justify-between border p-3 rounded-md">
                          <span>{status}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                            {index > 4 && (
                              <Button variant="destructive" size="sm">
                                Supprimer
                              </Button>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                  <Button className="mt-4" variant="outline">
                    Ajouter un statut
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Statuts des bons de distribution</h3>
                  <div className="space-y-2">
                    {["En cours", "Complété", "Annulé"].map((status, index) => (
                      <div key={index} className="flex items-center justify-between border p-3 rounded-md">
                        <span>{status}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                          {index > 2 && (
                            <Button variant="destructive" size="sm">
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4" variant="outline">
                    Ajouter un statut
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numerotation">
          <Card>
            <CardHeader>
              <CardTitle>Format de numérotation</CardTitle>
              <CardDescription>
                Configurez le format des numéros pour les colis et les bons de distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Format des numéros de colis</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="colis-prefix">Préfixe</Label>
                    <Input id="colis-prefix" defaultValue="COL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colis-separator">Séparateur</Label>
                    <Input id="colis-separator" defaultValue="-" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colis-year">Inclure l'année</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger id="colis-year">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Oui</SelectItem>
                        <SelectItem value="no">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colis-digits">Nombre de chiffres</Label>
                    <Select defaultValue="4">
                      <SelectTrigger id="colis-digits">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 chiffres</SelectItem>
                        <SelectItem value="4">4 chiffres</SelectItem>
                        <SelectItem value="5">5 chiffres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Aperçu: <strong>COL-2025-0001</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Format des numéros de bons de distribution</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bon-prefix">Préfixe</Label>
                    <Input id="bon-prefix" defaultValue="BD" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bon-separator">Séparateur</Label>
                    <Input id="bon-separator" defaultValue="-" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bon-year">Inclure l'année</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger id="bon-year">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Oui</SelectItem>
                        <SelectItem value="no">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bon-digits">Nombre de chiffres</Label>
                    <Select defaultValue="4">
                      <SelectTrigger id="bon-digits">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 chiffres</SelectItem>
                        <SelectItem value="4">4 chiffres</SelectItem>
                        <SelectItem value="5">5 chiffres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Aperçu: <strong>BD-2025-0001</strong>
                  </p>
                </div>
              </div>

              <Button>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilisateurs">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>Gérez les utilisateurs et leurs rôles dans le système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Utilisateurs</h3>
                  <Button>Ajouter un utilisateur</Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Admin Système</TableCell>
                      <TableCell>admin@logitrack.fr</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                          <Button variant="destructive" size="sm">
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jean Lefebvre</TableCell>
                      <TableCell>jean.lefebvre@example.com</TableCell>
                      <TableCell>Livreur</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                          <Button variant="destructive" size="sm">
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Marie Dubois</TableCell>
                      <TableCell>marie.dubois@example.com</TableCell>
                      <TableCell>Opérateur</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                          <Button variant="destructive" size="sm">
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-medium">Rôles et permissions</h3>
                  <div className="space-y-2">
                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">Admin</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Accès complet à toutes les fonctionnalités du système
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Gestion des utilisateurs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Configuration système</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Gestion des colis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Assignation des livreurs</span>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">Livreur</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Accès limité aux bons de distribution et colis assignés
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Voir les bons assignés</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Modifier statut des colis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span>Gestion des clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span>Configuration système</span>
                        </div>
                      </div>
                    </div>

                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">Opérateur</h4>
                      <p className="text-sm text-muted-foreground mb-2">Gestion des colis, clients et entreprises</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Créer/éditer colis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Gestion des clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Générer bons de distribution</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span>Gestion des utilisateurs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  )
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b transition-colors hover:bg-muted/50">{children}</tr>
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`h-12 px-4 text-left align-middle font-medium ${className || ""}`}>{children}</th>
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-4 align-middle ${className || ""}`}>{children}</td>
}
