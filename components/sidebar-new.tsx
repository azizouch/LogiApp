"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/components/sidebar-provider"
import { useRoleAccess } from "@/hooks/use-role-access"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"
import { type UserRole } from "@/contexts/auth-context"
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
  Menu,
  UserCog,
  User,
  ChevronDown,
  ClipboardList,
  Receipt,
  RotateCcw,
  UserCircle,
  Database
} from "lucide-react"

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

export function Sidebar() {
  const { isOpen, toggle, isMobile } = useSidebar()
  const pathname = usePathname()
  const { getUserRole, hasAccess } = useRoleAccess() // Use our role access hook
  const [tooltipInfo, setTooltipInfo] = useState<{text: string, x: number, y: number} | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [filteredNavItems, setFilteredNavItems] = useState(navItems)

  // Set up mounted state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Filter navigation items based on user role
  useEffect(() => {
    const userRole = getUserRole()
    if (!userRole) return

    // Filter the navigation items based on user role
    const filtered = navItems
      .filter(item => {
        // Check if the user has access to this item
        const hasItemAccess = item.roles.includes(userRole)

        // For submenu items, also check submenu items
        if (item.submenu && item.submenuItems) {
          // Check if there are any accessible submenu items
          const hasAccessibleSubItems = item.submenuItems.some(subItem =>
            subItem.roles.includes(userRole)
          )

          // If there are no accessible submenu items, don't show the parent menu
          return hasItemAccess && hasAccessibleSubItems
        }

        return hasItemAccess
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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile && isOpen) {
        // Check if click is outside sidebar
        const sidebar = document.getElementById('main-sidebar')
        const target = e.target as HTMLElement

        // Don't close if clicking on a submenu toggle button or its children
        if (target.closest('[data-submenu-toggle="true"]')) {
          return
        }

        // Don't close if clicking on the sidebar toggle button
        if (target.closest('[data-sidebar-toggle="true"]')) {
          return
        }

        // Close if clicking outside the sidebar
        if (sidebar && !sidebar.contains(target)) {
          toggle()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, isOpen, toggle])

  return (
    <div>
      {/* Mobile menu toggle button is now in the header */}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={(e) => {
            // Only close if clicking directly on the overlay
            if (e.target === e.currentTarget) {
              toggle();
            }
          }}
          aria-hidden="true"
        />
      )}

      <div
        id="main-sidebar"
        className={cn(
          "fixed top-0 left-0 h-screen border-r bg-background transition-all duration-300 overflow-y-auto overflow-x-hidden",
          isOpen ? "w-64" : (isMobile ? "w-0" : "w-16"),
          "z-50",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          {isOpen ? (
            <div className="flex w-full items-center justify-between">
              <h1 className="font-semibold truncate max-w-[160px]">LogiTrack</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                data-sidebar-toggle="true"
                className="h-8 w-8 relative z-50 ml-2 flex-shrink-0 bg-background hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex w-full justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                data-sidebar-toggle="true"
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2 p-4 pt-2">
          {filteredNavItems.map((item) => (
            <div
              key={item.title}
              className="relative"
              onMouseEnter={(e) => {
                if (!isOpen) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipInfo({
                    text: item.title,
                    x: rect.right + 10,
                    y: rect.top + rect.height / 2
                  });
                }
              }}
              onMouseLeave={() => setTooltipInfo(null)}
            >
              {item.submenu ? (
                <div className="space-y-1">
                  <button
                    data-submenu-toggle="true"
                    data-submenu-name={item.title}
                    onClick={(e) => {
                      // Prevent default behavior and event propagation
                      e.preventDefault();
                      e.stopPropagation();

                      // Toggle submenu
                      setOpenSubmenu(openSubmenu === item.title ? null : item.title);

                      // Important: Do not close the sidebar on mobile
                      // This is a no-op function to ensure the sidebar stays open
                    }}
                    className={cn(
                      "flex w-full h-10 items-center rounded-md px-3 text-sm font-medium transition-colors relative",
                      "hover:bg-accent hover:text-accent-foreground",
                      !isOpen && "justify-center",
                    )}
                  >
                    <item.icon className={cn(
                      "transition-all flex-shrink-0",
                      isOpen ? "h-5 w-5 mr-2" : "h-6 w-6 group-hover:scale-110"
                    )} />
                    {isOpen && (
                      <>
                        <span className="truncate max-w-[140px]">{item.title}</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform ml-2",
                          openSubmenu === item.title && "transform rotate-180"
                        )} />
                      </>
                    )}
                  </button>
                  {isOpen && openSubmenu === item.title && (
                    <div className="pl-4 space-y-1">
                      {item.submenuItems?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => {
                            // Auto-close sidebar on mobile when a link is clicked
                            if (isMobile) {
                              toggle();
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
                          <span className="truncate max-w-[100px]">{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  onClick={() => {
                    // Auto-close sidebar on mobile when a link is clicked
                    if (isMobile) {
                      toggle();
                    }
                  }}
                  className={cn(
                    "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors relative",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                    !isOpen && "justify-center",
                  )}
                >
                  <item.icon className={cn(
                    "transition-all flex-shrink-0",
                    isOpen ? "h-5 w-5 mr-2" : "h-6 w-6 group-hover:scale-110"
                  )} />
                  {isOpen && <span className="truncate max-w-[140px]">{item.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <ThemeToggle />
        </div>
      </div>

      {isMounted && tooltipInfo && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${tooltipInfo.x}px`,
            top: `${tooltipInfo.y}px`,
            transform: 'translateY(-50%)',
            zIndex: 60,
            backgroundColor: 'black',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {tooltipInfo.text}
        </div>,
        document.body
      )}
    </div>
  )
}
