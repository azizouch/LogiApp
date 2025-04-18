"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Package,
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Table,
  CheckCircle
} from "lucide-react"

const navItems = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Colis",
    href: "/colis",
    icon: Package,
  },
  {
    title: "Bons de distribution",
    href: "/bons",
    icon: FileText,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Entreprises",
    href: "/entreprises",
    icon: Building2,
  },
  {
    title: "Livreurs",
    href: "/livreurs",
    icon: Truck,
  },
  {
    title: "Supabase Test",
    href: "/supabase-test",
    icon: Database,
  },
  {
    title: "Connection Test",
    href: "/supabase-connection-test",
    icon: CheckCircle,
  },
  {
    title: "Create Tables",
    href: "/create-tables",
    icon: Table,
  },
  {
    title: "Paramètres",
    href: "/parametres",
    icon: Settings,
  },
]

export function Sidebar() {
  const { isOpen, toggle } = useSidebar()
  const pathname = usePathname()

  return (
    <div
      className={cn("relative h-screen border-r bg-background transition-all duration-300", isOpen ? "w-64" : "w-16")}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h1 className={cn("font-semibold transition-opacity", isOpen ? "opacity-100" : "opacity-0")}>LogiTrack</h1>
        <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
              !isOpen && "justify-center",
            )}
          >
            <item.icon className={cn("h-5 w-5", isOpen && "mr-2")} />
            {isOpen && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  )
}
