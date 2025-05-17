"use client"

import Image from "next/image"

export function AuthLoading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden border-2 border-primary/20 p-2">
          <Image
            src="/fast_delivery.png"
            alt="LogiTrack Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-primary mb-6">LogiTrack</h1>
      </div>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-sm">Chargement de l'application...</p>
      </div>
    </div>
  )
}
