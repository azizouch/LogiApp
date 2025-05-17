"use client"

import Link from "next/link"
import { ArrowUp } from "lucide-react"

export function SidebarDebug() {
  return (
    <div className="fixed top-20 right-4 z-[9999] bg-red-500 text-white p-4 rounded-lg shadow-lg">
      <h2 className="font-bold mb-2">Sidebar Debug</h2>
      <Link href="/test-scroll" className="flex items-center hover:underline">
        <ArrowUp className="mr-2 h-4 w-4" />
        <span>Test Scroll Page</span>
      </Link>
    </div>
  )
}
