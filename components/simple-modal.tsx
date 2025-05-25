"use client"

import React, { useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg'
}: SimpleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/80">
      <div 
        ref={modalRef}
        className={cn(
          "fixed left-[50%] top-[50%] z-[100] w-full translate-x-[-50%] translate-y-[-50%] bg-background p-6 shadow-lg rounded-lg",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Content */}
        <div className="py-2">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function SimpleModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>
}
