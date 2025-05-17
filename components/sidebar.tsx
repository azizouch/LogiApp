"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/sidebar-provider"
// We get UserRole type from the useRoleAccess hook
import { useRoleAccess, type UserRole } from "@/hooks/use-role-access"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip } from "@/components/tooltip"
import {
  Package,
  PackageCheck,
  PackageX,
  Home,
  Users,
  FileText,
  Building2,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCog,
  User,
  ChevronDown,
  ClipboardList,
  Receipt,
  RotateCcw,
  UserCircle,
  LucideIcon
} from "lucide-react"

// Define types for navigation items
interface NavItemBase {
  title: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
}

interface NavItemWithHref extends NavItemBase {
  href: string;
  submenu?: never;
  submenuItems?: never;
}

interface NavItemWithSubmenu extends NavItemBase {
  href?: never;
  submenu: true;
  submenuItems: Array<NavItemWithHref>;
}

type NavItem = NavItemWithHref | NavItemWithSubmenu;

// Define navigation items with role-based access control
const navItems: NavItem[] = [
  {
    title: "Accueil",
    href: "/dashboard",
    icon: Home,
    roles: ["Admin", "Gestionnaire", "Livreur"], // All roles can access dashboard
  },
  {
    title: "Colis",
    icon: Package,
    submenu: true,
    roles: ["Admin", "Gestionnaire", "Livreur"], // All roles can access colis menu
    submenuItems: [
      {
        title: "Liste Colis",
        href: "/liste-colis",
        icon: Package,
        roles: ["Admin", "Gestionnaire"], // Admin and Gestionnaire can access colis list
      },
      {
        title: "Mes Colis",
        href: "/mes-colis",
        icon: Package,
        roles: ["Livreur"], // Only Livreur can access their assigned colis
      },
      {
        title: "Colis Livrés",
        href: "/colis/livres",
        icon: PackageCheck,
        roles: ["Admin", "Gestionnaire"], // Admin and Gestionnaire access dashboard colis livres
      },
      {
        title: "Colis Livrés",
        href: "/livreur/colis/livres",
        icon: PackageCheck,
        roles: ["Livreur"], // Livreur access livreur colis livres
      },
      {
        title: "Colis Refusés",
        href: "/colis/refuses",
        icon: PackageX,
        roles: ["Admin", "Gestionnaire"], // Admin and Gestionnaire access dashboard colis refuses
      },
      {
        title: "Colis Refusés",
        href: "/livreur/colis/refuses",
        icon: PackageX,
        roles: ["Livreur"], // Livreur access livreur colis refuses
      },
      {
        title: "Colis Annulés",
        href: "/colis/annules",
        icon: Package,
        roles: ["Admin", "Gestionnaire"], // Admin and Gestionnaire access dashboard colis annules
      },
      {
        title: "Colis Annulés",
        href: "/livreur/colis/annules",
        icon: Package,
        roles: ["Livreur"], // Livreur access livreur colis annules
      },
    ],
  },
  {
    title: "Colis Relancé",
    href: "/colis/relance",
    icon: RotateCcw,
    badge: "0",
    roles: ["Livreur"], // Only Livreur can access relanced colis
  },
  {
    title: "Relancé Autre Client",
    href: "/colis/relance-autre",
    icon: UserCircle,
    badge: "0",
    roles: ["Livreur"], // Only Livreur can access other client relanced colis
  },
  {
    title: "Bons",
    icon: ClipboardList,
    submenu: true,
    roles: ["Admin", "Gestionnaire", "Livreur"], // All roles can see bons menu
    submenuItems: [
      {
        title: "Distribution",
        href: "/bons",
        icon: FileText,
        roles: ["Admin", "Gestionnaire", "Livreur"], // All roles can access bons distribution
      },
      {
        title: "Paiement",
        href: "/bons-paiement",
        icon: Receipt,
        roles: ["Admin", "Gestionnaire", "Livreur"], // Only Admin and Gestionnaire can access bons paiement
      },
      {
        title: "Retour",
        href: "/bons-retour",
        icon: RotateCcw,
        roles: ["Admin", "Gestionnaire", "Livreur"], // Only Admin and Gestionnaire can access bons retour
      },
    ],
  },
  {
    title: "Clients",
    href: "/clients",
    icon: UserCircle,
    roles: ["Admin", "Gestionnaire"], // Only Admin and Gestionnaire can access clients
  },
  {
    title: "Entreprises",
    href: "/entreprises",
    icon: Building2,
    roles: ["Admin", "Gestionnaire"], // Only Admin and Gestionnaire can access entreprises
  },
  {
    title: "Livreurs",
    href: "/livreurs",
    icon: Truck,
    roles: ["Admin", "Gestionnaire"], // Only Admin and Gestionnaire can access livreurs
  },
  {
    title: "Utilisateurs",
    icon: Users,
    submenu: true,
    roles: ["Admin"], // Only Admin can see utilisateurs menu
    submenuItems: [
      {
        title: "Gestion",
        href: "/utilisateur",
        icon: User,
        roles: ["Admin"], // Only Admin can access utilisateur management
      },
      {
        title: "Suivi",
        href: "/track-users",
        icon: UserCog,
        roles: ["Admin"], // Only Admin can access user tracking
      },
    ],
  },
  {
    title: "Paramètres",
    icon: Settings,
    submenu: true,
    roles: ["Admin"], // Only Admin can access paramètres
    submenuItems: [
      {
        title: "Général",
        href: "/parametres",
        icon: Settings,
        roles: ["Admin"],
      },
      {
        title: "Statuts",
        href: "/dashboard/parametres/statuts",
        icon: Package,
        roles: ["Admin"],
      },
    ],
  },

]

export function Sidebar() {
  const { isOpen, toggle } = useSidebar()
  const pathname = usePathname()
  const { hasAccess } = useRoleAccess() // Use our custom hook
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // Check if the current path is in a submenu to keep it open
  useEffect(() => {
    navItems.forEach(item => {
      if (item.submenu && item.submenuItems) {
        const isInSubmenu = item.submenuItems.some(subItem => pathname === subItem.href)
        if (isInSubmenu) {
          setOpenSubmenu(item.title)
        }
      }
    })
  }, [pathname]);

  const { isMobile, closeSidebar } = useSidebar()

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-[60] h-screen border-r bg-background transition-all duration-300 overflow-y-auto overflow-x-hidden",
        isOpen ? "w-64" : "w-16",
        // Hide sidebar on mobile when closed
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        {isOpen ? (
          <div className="flex w-full items-center justify-between">
            <h1 className="font-semibold">LogiTrack</h1>
            <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-2 p-4">

        {navItems.map((item) => {
          // Skip items the user doesn't have access to
          if (!hasAccess(item.roles)) return null;

          return (
            <div key={item.title || item.href} className="relative group">
              {item.submenu ? (
                <div className="space-y-1">
                  {!isOpen ? (
                    <Tooltip content={item.title}>
                      <button
                        onClick={() => setOpenSubmenu(openSubmenu === item.title ? null : item.title)}
                        className={cn(
                          "flex w-full h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "justify-center",
                        )}
                      >
                        <item.icon className={cn(
                          "transition-all",
                          "h-6 w-6 group-hover:scale-110 flex-shrink-0"
                        )} />
                      </button>
                    </Tooltip>
                  ) : (
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.title ? null : item.title)}
                      className={cn(
                        "flex w-full h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className={cn(
                        "transition-all",
                        "h-5 w-5 mr-2"
                      )} />
                      <span className="mr-2">{item.title}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        openSubmenu === item.title && "transform rotate-180"
                      )} />
                    </button>
                  )}
                  {isOpen && openSubmenu === item.title && (
                    <div className="pl-4 space-y-1">
                      {item.submenuItems?.filter(subItem => hasAccess(subItem.roles)).map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => {
                            if (isMobile) {
                              closeSidebar();
                            }
                          }}
                          className={cn(
                            "flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors",
                            pathname === subItem.href
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <subItem.icon className="h-4 w-4 mr-2" />
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {!isOpen ? (
                    <Tooltip content={item.title}>
                      <Link
                        href={item.href ?? '#'}
                        onClick={() => {
                          if (isMobile) {
                            closeSidebar();
                          }
                        }}
                        className={cn(
                          "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors justify-center relative",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className={cn(
                          "transition-all",
                          "h-6 w-6 group-hover:scale-110 flex-shrink-0"
                        )} />
                        {item.badge && (
                          <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </Tooltip>
                  ) : (
                    <Link
                      href={item.href ?? '#'}
                      onClick={() => {
                        if (isMobile) {
                          closeSidebar();
                        }
                      }}
                      className={cn(
                        "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className={cn(
                        "transition-all",
                        "h-5 w-5 mr-2"
                      )} />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  )
}
