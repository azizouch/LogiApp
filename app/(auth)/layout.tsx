import type { Metadata } from "next"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Connexion | LogiTrack",
  description: "Connectez-vous à votre compte LogiTrack",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
      {children}
    </div>
  )
}
