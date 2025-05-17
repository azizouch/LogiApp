"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PackageCheck, Truck, PackageX, Clock, Users, Building2 } from "lucide-react"

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // Format date on client side only
    setFormattedDate(
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="text-sm text-muted-foreground">
          {formattedDate}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="En attente"
          value="24"
          icon={Clock}
          description="Colis à prendre en charge"
          className="border-yellow-200 dark:border-yellow-900"
        />
        <StatusCard
          title="En cours"
          value="18"
          icon={Truck}
          description="Colis en livraison"
          className="border-blue-200 dark:border-blue-900"
        />
        <StatusCard
          title="Livrés"
          value="156"
          icon={PackageCheck}
          description="Colis livrés ce mois"
          className="border-green-200 dark:border-green-900"
        />
        <StatusCard
          title="Retournés"
          value="7"
          icon={PackageX}
          description="Colis retournés ce mois"
          className="border-red-200 dark:border-red-900"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Colis par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar label="En attente" value={24} max={205} color="bg-yellow-500" />
              <StatusBar label="Pris en charge" value={18} max={205} color="bg-blue-500" />
              <StatusBar label="En livraison" value={32} max={205} color="bg-indigo-500" />
              <StatusBar label="Livrés" value={124} max={205} color="bg-green-500" />
              <StatusBar label="Retournés" value={7} max={205} color="bg-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                title="Colis #BD-2025-0042 livré"
                description="Livré par Martin Dupont"
                time="Il y a 25 minutes"
              />
              <ActivityItem
                title="Nouveau bon de distribution"
                description="BD-2025-0043 créé pour Sophie Laurent"
                time="Il y a 1 heure"
              />
              <ActivityItem
                title="Colis #BD-2025-0039 en cours"
                description="Pris en charge par Jean Lefebvre"
                time="Il y a 2 heures"
              />
              <ActivityItem
                title="Nouveau client ajouté"
                description="Entreprise: Tech Solutions"
                time="Il y a 3 heures"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Aperçu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatItem icon={Package} label="Total colis" value="205" />
              <StatItem icon={Users} label="Clients actifs" value="87" />
              <StatItem icon={Building2} label="Entreprises" value="24" />
              <StatItem icon={Truck} label="Livreurs" value="12" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusCard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: {
  title: string
  value: string
  icon: React.ElementType
  description: string
  className?: string
}) {
  return (
    <Card className={cn("border-l-4", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const percentage = (value / max) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string
  description: string
  time: string
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
