import * as React from "react"
import { Outlet } from "react-router-dom"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Toaster } from "@/components/ui/sonner"
import { useNotificationHub } from "@/hooks/useNotificationHub"

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  // Initialize real-time notification connection
  useNotificationHub()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  )
}
