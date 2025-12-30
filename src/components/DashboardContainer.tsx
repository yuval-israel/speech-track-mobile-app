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

interface DashboardContainerProps {
  // Configs mostly ignored now as apiFetch handles env
  apiBaseUrl?: string
  authToken?: string
  onLogout: () => void
  onRequireOnboarding?: () => void
}

export function DashboardContainer({
  onLogout,
  onRequireOnboarding,
}: DashboardContainerProps) {
  const { data: dashboardData, loading: isLoading, error, refetch } = useDashboardData()
  const [currentChildId, setCurrentChildId] = useState<string | null>(null)

  const isNoChildError = error && error.toLowerCase().includes("no children")

  useEffect(() => {
    if (isNoChildError && onRequireOnboarding) {
      onRequireOnboarding()
    }
  }, [isNoChildError, onRequireOnboarding])

  // Handle child switching
  const handleSwitchChild = async (childId: string) => {
    setCurrentChildId(childId)
    refetch(childId)
  }

  // Handle recording upload
  const handleRecordingUpload = async (file: File, duration: number) => {
    const childId = currentChildId || dashboardData?.currentChild.id;
    if (!childId) {
      throw new Error("No child selected")
    }

    const formData = new FormData()
    formData.append("file", file)
    // Upload endpoint is POST /recordings/?child_id=...
    // Or body?
    // Step 5 says: "Connect the upload action to POST /recordings/. Important: This endpoint requires multipart/form-data. Ensure the file field matches the schema, and the child_id query parameter is passed correctly."
    // Let's check OpenAPI again if child_id is query or body.
    // OpenAPI for /recordings/ POST says: parameters (none?), Body_upload_recording_recordings__post (file). child_id? 
    // Wait, let me check the OpenAPI again for /recordings/ POST.

    // Assuming query param as per user prompt "child_id query parameter is passed correctly".
    await apiFetch(`/recordings/?child_id=${childId}`, {
      method: "POST",
      body: formData,
    })

    // Refetch dashboard data after successful upload
    refetch(childId)
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
          {isNoChildError && onRequireOnboarding ? (
            <button
              onClick={onRequireOnboarding}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Register Child
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Retry
            </button>
          )}
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
      onAddChild={onRequireOnboarding!}
    />
  )
}

