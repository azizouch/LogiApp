"use client"

import { useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface CustomToastProps {
  message: string
  type: ToastType
  duration?: number
}

export function showToast({ message, type, duration = 3000 }: CustomToastProps) {
  const icon = type === "success" 
    ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
    : type === "error" 
      ? <AlertCircle className="h-5 w-5 text-red-500" /> 
      : <Info className="h-5 w-5 text-blue-500" />
  
  const title = type === "success" 
    ? "Succès" 
    : type === "error" 
      ? "Erreur" 
      : "Information"
  
  toast({
    title,
    description: (
      <div className="flex items-start gap-2">
        {icon}
        <span>{message}</span>
      </div>
    ),
    duration,
    className: type === "success" 
      ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800" 
      : type === "error" 
        ? "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800" 
        : "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
  })
}

export function CustomToast({ message, type, duration }: CustomToastProps) {
  useEffect(() => {
    showToast({ message, type, duration })
  }, [message, type, duration])
  
  return null
}
