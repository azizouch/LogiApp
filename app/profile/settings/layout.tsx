import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Paramètres du compte | LogiTrack",
  description: "Gérez vos paramètres de compte et de sécurité",
}

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
