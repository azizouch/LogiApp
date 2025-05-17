"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AuthLoading } from "@/components/auth-loading"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Import auth context
  const { login, loading: authLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Use the login function from auth context
      const result = await login(email, password)

      if (result.success) {
        // Let the auth context handle storing user data

        // After successful login, redirect to dashboard
        // Use window.location for a hard navigation to avoid redirect loops
        window.location.href = "/dashboard";

        // Don't set isLoading to false here - let the auth context handle it
        return
      } else {
        setError(result.error || "Identifiants incorrects. Veuillez réessayer.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Une erreur est survenue. Veuillez réessayer.")
    }

    // Only set isLoading to false if login failed
    setIsLoading(false)
  }

  // Show loading screen if auth is in loading state
  if (authLoading) {
    return <AuthLoading />
  }

  return (
    <div className="w-full max-w-md space-y-8 animate-fade-in-down px-4 overflow-hidden">
        <Card className="border-t-4 border-t-primary shadow-xl relative pt-12 mt-16 hover:shadow-2xl transition-shadow duration-300">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full overflow-hidden border-3 border-primary/40 p-2 bg-white/95 shadow-lg mx-auto hover:scale-105 transition-transform duration-300">
            <Image
              src="/fast_delivery.png"
              alt="LogiTrack Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Se souvenir de moi
                </Label>
              </div>
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md animate-shake shadow-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="w-full transition-all duration-300 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas de compte?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Contactez l'administrateur
              </Link>
            </p>
          </CardFooter>
        </Card>
    </div>
  )
}
