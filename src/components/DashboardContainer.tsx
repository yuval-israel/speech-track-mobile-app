"use client"

// Smart Component: Handles data fetching and state management

import { useState, useEffect } from "react"
import { DashboardView } from "./DashboardView"
import type { DashboardData, RecordingUploadPayload, Child } from "../types/api"
// ...
// ...
// ...
import { useDashboardData } from "../hooks/useDashboardData"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface DashboardContainerProps {
  // Configs mostly ignored now as apiFetch handles env
  apiBaseUrl?: string
  authToken?: string
  onLogout: () => void
}

export function DashboardContainer({
  onLogout,
}: DashboardContainerProps) {
  const { data: dashboardData, loading: isLoading, error, refetch } = useDashboardData()
  const [currentChildId, setCurrentChildId] = useState<string | null>(null)

  const isNoChildError = error && error.toLowerCase().includes("no children")

  // Handle child switching
  const handleSwitchChild = async (childId: string) => {
    setCurrentChildId(childId)
    refetch(childId)
  }

  // Refetch data when window gains focus or becomes visible
  useEffect(() => {
    const onFocus = () => {
      refetch(currentChildId || undefined)
    }

    window.addEventListener("focus", onFocus)

    // Also handle visibility change (e.g. switching tabs on mobile)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onFocus()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [refetch, currentChildId])

  // Handle recording upload
  const handleRecordingUpload = async (file: File, duration: number) => {
    const childId = currentChildId || dashboardData?.currentChild.id;
    if (!childId) {
      throw new Error("No child selected")
    }

    const formData = new FormData()
    formData.append("file", file)
    // Upload endpoint is POST /recordings/?child_id=...
    try {
      await apiFetch(`/recordings/?child_id=${childId}`, {
        method: "POST",
        body: formData,
      })

      // Refetch dashboard data after successful upload
      await refetch(childId)
      toast.success("Recording saved successfully!")
    } catch (e: any) {
      console.error("Upload failed", e)
      if (e.status === 422) {
        console.error("Validation Error Details:", e)
        toast.error("Upload rejected: Invalid format or missing data")
      } else {
        toast.error("Failed to save recording")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <p className="text-destructive mb-4">{error || "Failed to load dashboard"}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Retry
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentChild = dashboardData.children.find((c: Child) => c.id === currentChildId) || dashboardData.currentChild

  return (
    <DashboardView
      user={dashboardData.user}
      children={dashboardData.children}
      currentChild={currentChild}
      analysis={dashboardData.latestAnalysis}
      weeklyProgress={dashboardData.weeklyProgress}
      missedRecordings={dashboardData.missedRecordings}
      routines={dashboardData.routines}
      onSwitchChild={handleSwitchChild}
      onRecordingUpload={handleRecordingUpload}
      onLogout={onLogout}
      onAddChild={() => alert("Add Child flow coming in next update")}
      onRefresh={async () => { await refetch() }}
    />
  )
}

