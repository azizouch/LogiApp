"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PackageCheck, Truck, PackageX, Clock, Users, Building2, Award, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { user } = useAuth()
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Livreur statistics
  const [todayDeliveries, setTodayDeliveries] = useState(0);
  const [inProgressDeliveries, setInProgressDeliveries] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [returnedDeliveries, setReturnedDeliveries] = useState(0);
  const [todayColisItems, setTodayColisItems] = useState<any[]>([]);
  const [userZone, setUserZone] = useState<string>("");
  const [userVehicle, setUserVehicle] = useState<string>("");
  const [monthlyDeliveries, setMonthlyDeliveries] = useState(0);

  // Admin statistics
  const [totalPending, setTotalPending] = useState(0);
  const [totalInProgress, setTotalInProgress] = useState(0);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [totalReturned, setTotalReturned] = useState(0);
  const [totalColis, setTotalColis] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalEntreprises, setTotalEntreprises] = useState(0);
  const [totalLivreurs, setTotalLivreurs] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

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

    // Get user info from localStorage if not available from context
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserRole(parsedUser.role);
          setUserId(parsedUser.id);
          setUserName(`${parsedUser.prenom || ''} ${parsedUser.nom || ''}`.trim());
          setUserZone(parsedUser.zone || "Non définie");
          setUserVehicle(parsedUser.vehicule || "Non défini");
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    } else {
      setUserRole(user.role);
      setUserId(user.id);
      setUserName(`${user.prenom || ''} ${user.nom || ''}`.trim());
      setUserZone(user.zone || "Non définie");
      setUserVehicle(user.vehicule || "Non défini");
    }
  }, [user]);

  // Fetch livreur statistics
  useEffect(() => {
    if (userRole === "Livreur" && userId) {
      const fetchLivreurStats = async () => {
        try {
          // Get today's date in ISO format (YYYY-MM-DD)
          const today = new Date().toISOString().split('T')[0];

          // Get first day of current month
          const firstDayOfMonth = new Date();
          firstDayOfMonth.setDate(1);
          const firstDayISO = firstDayOfMonth.toISOString().split('T')[0];

          // Fetch today's deliveries
          const { data: todayData, error: todayError } = await supabase
            .from('colis')
            .select(`
              id,
              client:client_id(id, nom, adresse, ville),
              statut,
              date_creation,
              date_mise_a_jour
            `)
            .eq('livreur_id', userId)
            .gte('date_creation', today);

          if (todayError) {
            console.error('Error fetching today deliveries:', todayError);
          } else {
            setTodayDeliveries(todayData?.length || 0);
            setTodayColisItems(todayData || []);

            // Count by status
            const inProgress = todayData?.filter(colis =>
              colis.statut === 'En cours' ||
              colis.statut === 'En cours de livraison' ||
              colis.statut === 'Pris en charge' ||
              colis.statut === 'En route' ||
              colis.statut === 'En voyage' ||
              colis.statut === 'Mise en distribution' ||
              colis.statut === 'Sortie pour la livrison' ||
              colis.statut === 'Programmer' ||
              colis.statut === 'Confirmer' ||
              colis.statut === 'Recu pour ville' ||
              colis.statut === 'Ramasse' ||
              colis.statut === 'Attente de ramassage' ||
              colis.statut === 'Expedie' ||
              colis.statut === 'Expedier par AMANA'
            ).length || 0;

            const completed = todayData?.filter(colis => colis.statut === 'Livré').length || 0;

            const returned = todayData?.filter(colis =>
              colis.statut === 'Retourné' ||
              colis.statut === 'Refusé' ||
              colis.statut === 'Annulé' ||
              colis.statut === 'Annulé par Vendeur'
            ).length || 0;

            setInProgressDeliveries(inProgress);
            setCompletedDeliveries(completed);
            setReturnedDeliveries(returned);
          }

          // Fetch monthly deliveries
          const { data: monthlyData, error: monthlyError } = await supabase
            .from('colis')
            .select(`
              id,
              statut,
              date_creation
            `)
            .eq('livreur_id', userId)
            .gte('date_creation', firstDayISO);

          if (monthlyError) {
            console.error('Error fetching monthly deliveries:', monthlyError);
          } else {
            setMonthlyDeliveries(monthlyData?.length || 0);
          }
        } catch (error) {
          console.error('Error fetching livreur statistics:', error);
        }
      };

      fetchLivreurStats();
    }
  }, [userRole, userId]);

  // Fetch admin statistics
  useEffect(() => {
    if (userRole === "Admin" || userRole === "Gestionnaire") {
      const fetchAdminStats = async () => {
        try {
          console.log("Fetching admin statistics...");

          // Fetch real colis data from the database
          const { data: colisData, error: colisError } = await supabase
            .from('colis')
            .select(`
              id,
              client:client_id(id, nom, adresse, ville),
              statut,
              date_creation,
              date_mise_a_jour
            `)
            .order('date_mise_a_jour', { ascending: false });

          if (colisError) {
            console.error('Error fetching colis data:', colisError);
            throw colisError;
          }

          console.log(`Fetched ${colisData?.length || 0} colis items from database`);

          // Set values based on your actual statuses
          let totalCount = colisData?.length || 0;

          // Group colis by status categories
          let pending = colisData?.filter(colis =>
            colis.statut === 'En attente' ||
            colis.statut === 'Nouveau Colis'
          ).length || 0;

          let inProgress = colisData?.filter(colis =>
            colis.statut === 'En cours' ||
            colis.statut === 'En cours de livraison' ||
            colis.statut === 'Pris en charge' ||
            colis.statut === 'En route' ||
            colis.statut === 'En voyage' ||
            colis.statut === 'Mise en distribution' ||
            colis.statut === 'Sortie pour la livrison' ||
            colis.statut === 'Programmer' ||
            colis.statut === 'Confirmer' ||
            colis.statut === 'Recu pour ville' ||
            colis.statut === 'Ramasse' ||
            colis.statut === 'Attente de ramassage' ||
            colis.statut === 'Expedie' ||
            colis.statut === 'Expedier par AMANA'
          ).length || 0;

          let delivered = colisData?.filter(colis => colis.statut === 'Livré').length || 0;

          let returned = colisData?.filter(colis =>
            colis.statut === 'Retourné' ||
            colis.statut === 'Refusé' ||
            colis.statut === 'Annulé' ||
            colis.statut === 'Annulé par Vendeur'
          ).length || 0;

          console.log(`Status counts - Pending: ${pending}, In Progress: ${inProgress}, Delivered: ${delivered}, Returned: ${returned}, Total: ${totalCount}`);

          // Set the state values
          setTotalColis(totalCount);
          setTotalPending(pending);
          setTotalInProgress(inProgress);
          setTotalDelivered(delivered);
          setTotalReturned(returned);

          // Get recent activities from real colis data
          const recentColisData = colisData?.slice(0, 4) || [];
          console.log('Recent activities:', recentColisData);
          setRecentActivities(recentColisData);

          // Fetch real counts for clients, entreprises, and livreurs
          const [clientsResult, entreprisesResult, livreursResult] = await Promise.all([
            supabase.from('clients').select('count', { count: 'exact', head: true }),
            supabase.from('entreprises').select('count', { count: 'exact', head: true }),
            supabase.from('utilisateurs').select('count', { count: 'exact', head: true }).eq('role', 'Livreur')
          ]);

          const clientsCount = clientsResult.count || 0;
          const entreprisesCount = entreprisesResult.count || 0;
          const livreursCount = livreursResult.count || 0;

          console.log(`Real counts - Clients: ${clientsCount}, Entreprises: ${entreprisesCount}, Livreurs: ${livreursCount}`);

          // Set the state values
          setTotalClients(clientsCount);
          setTotalEntreprises(entreprisesCount);
          setTotalLivreurs(livreursCount);
        } catch (error) {
          console.error('Error fetching admin statistics:', error);
        }
      };

      fetchAdminStats();
    }
  }, [userRole]);

  // Render livreur dashboard
  if (userRole === "Livreur") {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tableau de bord Livreur</h1>
          <div className="text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            title="À livrer aujourd'hui"
            value={todayDeliveries.toString()}
            icon={Clock}
            description="Colis à livrer aujourd'hui"
            className="border-yellow-200 dark:border-yellow-900"
          />
          <StatusCard
            title="En cours"
            value={inProgressDeliveries.toString()}
            icon={Truck}
            description="Colis en cours de livraison"
            className="border-blue-200 dark:border-blue-900"
          />
          <StatusCard
            title="Livrés aujourd'hui"
            value={completedDeliveries.toString()}
            icon={PackageCheck}
            description="Colis livrés aujourd'hui"
            className="border-green-200 dark:border-green-900"
          />
          <StatusCard
            title="Retournés"
            value={returnedDeliveries.toString()}
            icon={PackageX}
            description="Colis retournés aujourd'hui"
            className="border-red-200 dark:border-red-900"
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mes livraisons du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayColisItems && todayColisItems.length > 0 ? (
                  todayColisItems.slice(0, 4).map((colis, index) => {
                    if (!colis) {
                      return (
                        <ActivityItem
                          key={`unknown-${index}`}
                          title="Colis"
                          description="Information non disponible"
                          time="Statut inconnu"
                        />
                      );
                    }

                    return (
                      <ActivityItem
                        key={colis.id || `colis-${index}`}
                        title={`Colis #${colis.id || 'N/A'}`}
                        description={colis.client && colis.client.adresse ?
                          `${colis.client.adresse}${colis.client.ville ? `, ${colis.client.ville}` : ''}` :
                          "Adresse non spécifiée"}
                        time={colis.statut || "Statut inconnu"}
                      />
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune livraison prévue pour aujourd'hui</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mes performances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatusBar
                  label="Livraisons à temps"
                  value={completedDeliveries}
                  max={Math.max(completedDeliveries + inProgressDeliveries, 1)}
                  color="bg-green-500"
                />
                <StatusBar
                  label="Colis en cours"
                  value={inProgressDeliveries}
                  max={Math.max(todayDeliveries, 1)}
                  color="bg-blue-500"
                />
                <StatusBar
                  label="Colis retournés"
                  value={returnedDeliveries}
                  max={Math.max(todayDeliveries, 1)}
                  color="bg-red-500"
                />
                <StatusBar
                  label="Progression journalière"
                  value={completedDeliveries + inProgressDeliveries}
                  max={Math.max(todayDeliveries, 1)}
                  color="bg-yellow-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mon profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatItem
                  icon={Award}
                  label="Livreur"
                  value={userName || "Non spécifié"}
                />
                <StatItem
                  icon={MapPin}
                  label="Zone"
                  value={userZone}
                />
                <StatItem
                  icon={Calendar}
                  label="Ce mois"
                  value={`${monthlyDeliveries} livraisons`}
                />
                <StatItem
                  icon={Truck}
                  label="Véhicule"
                  value={userVehicle}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render admin/gestionnaire dashboard (default)
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
          value={totalPending.toString()}
          icon={Clock}
          description="Colis en attente"
          className="border-yellow-200 dark:border-yellow-900"
        />
        <StatusCard
          title="En traitement"
          value={totalInProgress.toString()}
          icon={Truck}
          description="Pris en charge / En cours"
          className="border-blue-200 dark:border-blue-900"
        />
        <StatusCard
          title="Livrés"
          value={totalDelivered.toString()}
          icon={PackageCheck}
          description="Colis livrés"
          className="border-green-200 dark:border-green-900"
        />
        <StatusCard
          title="Retournés"
          value={totalReturned.toString()}
          icon={PackageX}
          description="Colis retournés"
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
              <StatusBar
                label="En attente"
                value={totalPending}
                max={Math.max(totalColis, 1)}
                color="bg-yellow-500"
              />
              <StatusBar
                label="Pris en charge / En cours"
                value={totalInProgress}
                max={Math.max(totalColis, 1)}
                color="bg-blue-500"
              />
              <StatusBar
                label="Livrés"
                value={totalDelivered}
                max={Math.max(totalColis, 1)}
                color="bg-green-500"
              />
              <StatusBar
                label="Retournés"
                value={totalReturned}
                max={Math.max(totalColis, 1)}
                color="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((colis) => {
                  if (!colis || !colis.date_creation) {
                    return (
                      <ActivityItem
                        key={Math.random().toString()}
                        title="Colis"
                        description="Information non disponible"
                        time="Date inconnue"
                      />
                    );
                  }

                  // Calculate time difference
                  const creationDate = new Date(colis.date_creation);
                  const now = new Date();
                  const diffMs = now.getTime() - creationDate.getTime();
                  const diffMins = Math.round(diffMs / 60000);
                  const diffHours = Math.round(diffMs / 3600000);
                  const diffDays = Math.round(diffMs / 86400000);

                  let timeAgo;
                  if (diffMins < 60) {
                    timeAgo = `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
                  } else if (diffHours < 24) {
                    timeAgo = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
                  } else {
                    timeAgo = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
                  }

                  return (
                    <ActivityItem
                      key={colis.id || Math.random().toString()}
                      title={`Colis #${colis.id || 'N/A'} ${(colis.statut || 'inconnu').toLowerCase()}`}
                      description={colis.client && colis.client.adresse ?
                        `${colis.client.adresse}${colis.client.ville ? `, ${colis.client.ville}` : ''}` :
                        "Adresse non spécifiée"}
                      time={timeAgo}
                    />
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm">Aucune activité récente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Aperçu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatItem
                icon={Package}
                label="Total colis"
                value={totalColis.toString()}
              />
              <StatItem
                icon={Users}
                label="Clients enregistrés"
                value={totalClients.toString()}
              />
              <StatItem
                icon={Building2}
                label="Entreprises partenaires"
                value={totalEntreprises.toString()}
              />
              <StatItem
                icon={Truck}
                label="Livreurs disponibles"
                value={totalLivreurs.toString()}
              />
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
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
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
    <div className="flex items-center space-x-3">
      <div className="rounded-md bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
