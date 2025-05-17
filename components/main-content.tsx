"use client"

import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import type React from "react"

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile, toggle, closeSidebar } = useSidebar();

  return (
    <>
      {/* Backdrop for mobile sidebar */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={(e) => {
            // Prevent event propagation
            e.stopPropagation();
            // Close the sidebar when clicking on the backdrop
            // Use closeSidebar instead of toggle to be explicit
            closeSidebar();
          }}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300 relative z-[40]",
          // On desktop: adjust margin based on sidebar state
          !isMobile && (isOpen ? "ml-64" : "ml-16"),
          // On mobile: no margin regardless of sidebar state
          isMobile && "ml-0"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 pb-8">
          {children}
        </main>
      </div>
    </>
  );
}
