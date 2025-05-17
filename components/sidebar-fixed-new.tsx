"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/sidebar-provider"
import { useRoleAccess } from "@/hooks/use-role-access"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Package,
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
  Database
} from "lucide-react"
import { useState, useEffect } from "react"
import { type UserRole } from "@/contexts/auth-context"

// Define navigation items with role-based access control
const navItems = [
  {
    title: "Accueil",
    href: "/dashboard",
    icon: Home,
    roles: ["Admin", "Gestionnaire", "Livreur"], // All roles can access dashboard
  },
  {
    title: "Colis",
    href: "/colis",
    icon: Package,
    roles: ["Admin", "Gestionnaire"], // Admin and Gestionnaire can access colis
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
        roles: ["Admin", "Gestionnaire"], // Only Admin and Gestionnaire can access bons paiement
      },
      {
        title: "Retour",
        href: "/bons-retour",
        icon: RotateCcw,
        roles: ["Admin", "Gestionnaire"], // Only Admin and Gestionnaire can access bons retour
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
    href: "/parametres",
    icon: Settings,
    roles: ["Admin"], // Only Admin can access paramètres
  },
  {
    title: "Base de données",
    href: "/db-management",
    icon: Database,
    roles: ["Admin"], // Only Admin can access database management
  },
]

export function SidebarFixedNew() {
  const { isOpen, toggle, closeSidebar } = useSidebar()
  const pathname = usePathname()
  const { getUserRole } = useRoleAccess() // Use our custom hook
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [filteredNavItems, setFilteredNavItems] = useState(navItems)
  const { isMobile } = useSidebar()

  // Filter nav items based on user role
  useEffect(() => {
    const userRole = getUserRole()
    if (!userRole) return

    // Filter the navigation items based on user role
    const filtered = navItems
      .filter(item => {
        // Check if the user has access to this item
        const hasAccess = item.roles.includes(userRole)

        // For submenu items, also check submenu items
        if (item.submenu && item.submenuItems) {
          // Check if there are any accessible submenu items
          const hasAccessibleSubItems = item.submenuItems.some(subItem =>
            subItem.roles.includes(userRole)
          )

          // If there are no accessible submenu items, don't show the parent menu
          return hasAccess && hasAccessibleSubItems
        }

        return hasAccess
      })
      .map(item => {
        // If it's a submenu item, filter the submenu items
        if (item.submenu && item.submenuItems) {
          return {
            ...item,
            submenuItems: item.submenuItems.filter(subItem =>
              subItem.roles.includes(userRole)
            )
          }
        }

        // Otherwise, return the item as is
        return item
      })

    setFilteredNavItems(filtered)
  }, [getUserRole])

  // Check if the current path is in a submenu to keep it open
  useEffect(() => {
    filteredNavItems.forEach(item => {
      if (item.submenu && item.submenuItems) {
        const isInSubmenu = item.submenuItems.some(subItem => pathname === subItem.href)
        if (isInSubmenu) {
          setOpenSubmenu(item.title)
        }
      }
    })
  }, [pathname, filteredNavItems])

  // Add a global event listener to handle submenu toggle clicks
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Check if the click was on a submenu toggle button
      if (target.closest('[data-submenu-toggle="true"]')) {
        // Prevent the sidebar from closing
        e.stopPropagation()
        e.preventDefault()

        // Get the submenu name
        const submenuName = target.closest('[data-submenu-toggle="true"]')?.getAttribute('data-submenu-name')
        console.log("Global click handler caught submenu toggle:", submenuName)

        // Force the sidebar to stay open on mobile
        if (isMobile && !isOpen) {
          console.log("Global handler forcing sidebar to stay open")
          setTimeout(() => {
            toggle()
          }, 50)
        }
      }
    }

    // Add the event listener
    document.addEventListener('click', handleGlobalClick, true)

    // Clean up
    return () => {
      document.removeEventListener('click', handleGlobalClick, true)
    }
  }, [isMobile, isOpen, toggle])

  // Function to toggle submenu without affecting sidebar
  const handleSubmenuToggle = (e: React.MouseEvent, title: string) => {
    // Prevent default browser behavior
    e.preventDefault()

    // Stop event propagation to prevent sidebar from closing
    e.stopPropagation()

    // Log for debugging
    console.log("Toggling submenu:", title, "Current state:", openSubmenu === title ? "open" : "closed")

    // Toggle the submenu state
    setOpenSubmenu(openSubmenu === title ? null : title)

    // Force the sidebar to stay open on mobile
    if (isMobile && !isOpen) {
      console.log("Forcing sidebar to stay open")
      // Use setTimeout to ensure this runs after any other event handlers
      setTimeout(() => {
        toggle()
      }, 50)
    }
  }

  // Function to handle navigation link clicks
  const handleNavLinkClick = () => {
    if (isMobile) {
      closeSidebar()
    }
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-50 h-screen border-r bg-background transition-all duration-300 overflow-y-auto overflow-x-hidden",
        // Desktop: show as expanded or collapsed based on isOpen
        !isMobile && (isOpen ? "w-64" : "w-16"),
        // Mobile: show as expanded when open, or completely hidden when closed
        isMobile && (isOpen ? "w-64" : "-translate-x-full w-64")
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
        {filteredNavItems.map((item) => (
          <div key={item.title || item.href} className="relative group">
            {item.submenu ? (
              <div className="space-y-1">
                <button
                  onClick={(e) => handleSubmenuToggle(e, item.title)}
                  data-submenu-toggle="true"
                  data-submenu-name={item.title}
                  className={cn(
                    "flex w-full h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    !isOpen && "justify-center",
                  )}
                >
                  <item.icon className={cn(
                    "transition-all",
                    isOpen ? "h-5 w-5 mr-2" : "h-6 w-6 group-hover:scale-110 flex-shrink-0"
                  )} />
                  {isOpen && (
                    <>
                      <span className="mr-2">{item.title}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        openSubmenu === item.title && "transform rotate-180"
                      )} />
                    </>
                  )}
                </button>
                {!isOpen && (
                  <div style={{zIndex: 9999}} className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-md bg-black text-white px-2 py-1 text-sm font-medium shadow-md opacity-0 -translate-x-2 invisible group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap">
                    {item.title}
                  </div>
                )}
                {isOpen && openSubmenu === item.title && (
                  <div className="pl-4 space-y-1">
                    {item.submenuItems?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors",
                          pathname === subItem.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                        onClick={handleNavLinkClick}
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
                <Link
                  href={item.href ?? '#'}
                  className={cn(
                    "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                    !isOpen && "justify-center",
                  )}
                  onClick={handleNavLinkClick}
                >
                  <item.icon className={cn(
                    "transition-all",
                    isOpen ? "h-5 w-5 mr-2" : "h-6 w-6 group-hover:scale-110 flex-shrink-0"
                  )} />
                  {isOpen && <span>{item.title}</span>}
                </Link>
                {!isOpen && (
                  <div style={{zIndex: 9999}} className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-md bg-black text-white px-2 py-1 text-sm font-medium shadow-md opacity-0 -translate-x-2 invisible group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  )
}
