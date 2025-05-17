"use client"

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Simple redirect without using sessionStorage to avoid loops
    const hasAuthCookie = document.cookie.includes('auth_token=')
    const storedUser = localStorage.getItem('user')

    if (hasAuthCookie && storedUser) {
      // If authenticated, redirect to dashboard
      window.location.href = '/dashboard'
    } else {
      // If not authenticated, redirect to login
      window.location.href = '/login'
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-6 mx-auto"></div>
        <h1 className="text-2xl font-bold mb-4">Redirection en cours...</h1>
        <p className="mb-4">Veuillez patienter pendant que nous vous redirigeons.</p>
        <button
          onClick={() => {
            window.location.href = '/login'
          }}
          className="text-sm text-primary hover:underline"
        >
          Cliquez ici si vous n'êtes pas redirigé automatiquement
        </button>
      </div>
    </div>
  )
}