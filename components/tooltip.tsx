"use client"

import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

interface TooltipProps {
  children: React.ReactNode
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        x: 64, // 16px (sidebar width) + some margin
        y: rect.top + rect.height / 2
      })
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const tooltipContent = (
    <div
      className="fixed rounded-md bg-black text-white px-2 py-1 text-sm font-medium shadow-md pointer-events-none whitespace-nowrap z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-50%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 200ms ease-in-out',
        visibility: isVisible ? 'visible' : 'hidden',
        translateX: isVisible ? '0' : '-8px'
      }}
    >
      {content}
    </div>
  )

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full"
    >
      {children}
      {mounted && createPortal(tooltipContent, document.body)}
    </div>
  )
}
