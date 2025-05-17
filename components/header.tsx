"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/components/sidebar-provider"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import { cn } from "@/lib/utils"
import { searchAll, type SearchResult } from "@/lib/search-service"
import { HybridLogoutButton } from "@/components/hybrid-logout-button"
import { DesktopLogoutButton } from "@/components/desktop-logout-button"
import { NotificationBell } from "@/components/notification-bell"
import {
  User,
  Menu,
  Search,
  X,
  Package,
  UserIcon,
  Truck,
  Building2,
  LogOut,
  Settings,
  UserCog,
  Mail,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const router = useRouter()
  const { toggle, isMobile, isOpen } = useSidebar()
  const { user, logout } = useAuth() // Get user and logout function from auth context
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileNotifications, setShowMobileNotifications] = useState(false)
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const mobileNotificationsRef = useRef<HTMLDivElement>(null)
  const mobileUserMenuRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside of search results to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile search when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if we're clicking outside the mobile search area and the search button
      const searchButton = document.getElementById('mobile-search-button')

      if (
        showMobileSearch &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node) &&
        searchButton &&
        !searchButton.contains(event.target as Node)
      ) {
        setShowMobileSearch(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMobileSearch) {
        setShowMobileSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMobileSearch])

  // Perform search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        const results = await searchAll(searchQuery)
        setSearchResults(results)
        setIsSearching(false)
        setShowResults(true)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Close mobile search when navigating away
  useEffect(() => {
    const handleRouteChange = () => {
      setShowMobileSearch(false)
      setShowMobileNotifications(false)
      setShowMobileUserMenu(false)
    }

    // Add event listener for route changes
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  // Add transition effect to header for smooth sidebar toggle
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      header.style.transition = 'left 0.3s ease'
    }
  }, [])

  // Handle clicks outside of mobile notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const notificationButton = document.getElementById('mobile-notification-button')

      if (
        showMobileNotifications &&
        mobileNotificationsRef.current &&
        !mobileNotificationsRef.current.contains(event.target as Node) &&
        notificationButton &&
        !notificationButton.contains(event.target as Node)
      ) {
        setShowMobileNotifications(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMobileNotifications) {
        setShowMobileNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMobileNotifications])

  // Handle clicks outside of mobile user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userButton = document.getElementById('mobile-user-button')

      if (
        showMobileUserMenu &&
        mobileUserMenuRef.current &&
        !mobileUserMenuRef.current.contains(event.target as Node) &&
        userButton &&
        !userButton.contains(event.target as Node)
      ) {
        setShowMobileUserMenu(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMobileUserMenu) {
        setShowMobileUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMobileUserMenu])

  // Get icon for result type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'colis': return <Package className="h-4 w-4" />
      case 'client': return <UserIcon className="h-4 w-4" />
      case 'livreur': return <Truck className="h-4 w-4" />
      case 'entreprise': return <Building2 className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  return (
    <>
      <header className={cn(
        "fixed top-0 z-[60] flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 shadow-sm",
        // Adjust left position and width based on sidebar state
        !isMobile && isOpen
          ? "left-64 right-0"
          : !isMobile
            ? "left-16 right-0"
            : "left-0 right-0"
      )}>
      {/* App name - centered on mobile, hidden on desktop */}
      <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center md:hidden pointer-events-none z-0">
        <h1 className="font-semibold text-lg">LogiTrack</h1>
      </div>

      <div className="flex flex-1 items-center gap-1 z-10">
        {/* Mobile menu button - only visible on mobile */}
        <Button
          variant="ghost"
          size="icon"
          data-sidebar-toggle="true"
          onClick={(e) => {
            // Prevent event propagation
            e.stopPropagation();
            e.preventDefault();
            toggle();
          }}
          className={cn(
            "md:hidden",
            isOpen && "invisible" // Hide when sidebar is open on mobile
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Mobile search button - only visible on small screens */}
        <Button
          id="mobile-search-button"
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Toggle search</span>
        </Button>

        {/* Search bar - always hidden on mobile, always visible on desktop */}
        <div className={cn(
          "w-full max-w-3xl flex-1",
          "hidden md:block" // Always hide on mobile, always show on desktop
        )} ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par ID, nom, adresse..."
            className="w-full pl-9 pr-9 h-9 bg-muted/40 focus-visible:bg-background focus-visible:ring-offset-0 focus-visible:ring-primary/20 placeholder:text-xs sm:placeholder:text-sm"
            aria-label="Rechercher colis par ID ou adresse, clients par nom ou contact, livreurs par nom ou zone, entreprises par nom ou description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-[999] max-h-[70vh] overflow-y-auto">
                <div className="p-2">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Résultats de recherche</h3>
                  <ul className="space-y-1">
                    {searchResults.map((result) => (
                      <li key={`${result.type}-${result.id}`}>
                        <Link
                          href={result.url}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                          onClick={() => {
                            setShowResults(false)
                            setSearchQuery('')
                          }}
                        >
                          <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                            {getIconForType(result.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* No Results State */}
            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Aucun résultat trouvé pour "{searchQuery}"</p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Recherche en cours...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User info and notifications - right aligned */}
      <div className="flex items-center gap-4 flex-shrink-0 z-10">
        {/* Notifications */}
        <NotificationBell className="relative rounded-full border h-8 w-8" />

        {/* User profile - Desktop Dropdown / Mobile Button */}
        <div>
          {/* Desktop Dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="text-right">
                    <div className="text-sm font-medium">{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</div>
                    <div className="text-xs text-muted-foreground">{user?.email || 'Non connecté'}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full border h-8 w-8">
                    <User className="h-4 w-4" />
                    <span className="sr-only">User profile</span>
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                alignOffset={-30}
                className="w-56 max-w-none"
              >
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/profile">
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 p-0"
                  onSelect={(e) => {
                    // Prevent the dropdown from closing immediately
                    e.preventDefault()
                  }}
                >
                  <DesktopLogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Button */}
          <Button
            id="mobile-user-button"
            variant="ghost"
            size="icon"
            className="rounded-full border h-8 w-8 md:hidden"
            onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
          >
            <User className="h-4 w-4" />
            <span className="sr-only">User profile</span>
          </Button>
        </div>
      </div>
    </header>

    {/* Mobile search bar that appears below the header when search button is clicked */}
    {isMobile && showMobileSearch && (
      <div
        ref={mobileSearchRef}
        className={cn(
          "fixed z-50 border-b bg-background shadow-sm",
          // Position it right below the header
          "top-16",
          // Adjust left position and width based on sidebar state
          !isMobile && isOpen
            ? "left-64 right-0"
            : !isMobile
              ? "left-16 right-0"
              : "left-0 right-0",
          // Add padding and max-width on mobile
          "px-4 py-2 sm:px-6 md:px-8",
          "w-[calc(100%-2rem)] mx-auto left-0 right-0"
        )}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-9 h-9 bg-muted/40 focus-visible:bg-background focus-visible:ring-offset-0 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearchQuery('');
              setShowMobileSearch(false);
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close search</span>
          </Button>
        </div>

        {/* Search Results for Mobile */}
        {showResults && searchResults.length > 0 && (
          <div className="mt-1 bg-background border rounded-md shadow-md z-50 max-h-[50vh] overflow-y-auto">
            <div className="p-2">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Résultats de recherche</h3>
              <ul className="space-y-1">
                {searchResults.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <Link
                      href={result.url}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                      onClick={() => {
                        setShowResults(false);
                        setSearchQuery('');
                        setShowMobileSearch(false);
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                        {getIconForType(result.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* No Results State for Mobile */}
        {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
          <div className="mt-1 bg-background border rounded-md shadow-md z-50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Aucun résultat trouvé pour "{searchQuery}"</p>
          </div>
        )}

        {/* Loading State for Mobile */}
        {isSearching && (
          <div className="mt-1 bg-background border rounded-md shadow-md z-50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Recherche en cours...</p>
          </div>
        )}
      </div>
    )}

    {/* We're now using the NotificationBell component which handles both desktop and mobile */}

    {/* Mobile user menu panel that appears below the header */}
    {isMobile && showMobileUserMenu && (
      <div
        ref={mobileUserMenuRef}
        className={cn(
          "fixed z-50 border-b bg-background shadow-sm",
          // Position it right below the header
          "top-16",
          // Adjust left position and width based on sidebar state
          !isMobile && isOpen
            ? "left-64 right-0"
            : !isMobile
              ? "left-16 right-0"
              : "left-0 right-0",
          // Add padding and max-width on mobile
          "px-4 py-2 sm:px-6 md:px-8",
          "w-[calc(100%-2rem)] mx-auto left-0 right-0"
        )}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium">Mon compte</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setShowMobileUserMenu(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-2 p-2 border rounded-md">
          <div className="h-12 w-12 rounded-full border flex items-center justify-center bg-muted">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</p>
            <p className="text-sm text-muted-foreground">{user?.email || 'Non connecté'}</p>
          </div>
        </div>

        <div className="space-y-0.5">
          <Link
            href="/profile"
            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setShowMobileUserMenu(false)}
          >
            <UserCog className="h-4 w-4 text-muted-foreground" />
            <span>Profil</span>
          </Link>

          <Link
            href="/profile/settings"
            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setShowMobileUserMenu(false)}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Paramètres</span>
          </Link>

          <HybridLogoutButton
            isMobile={true}
            onBeforeLogout={() => setShowMobileUserMenu(false)}
          />
        </div>
      </div>
    )}
    </>
  )
}
