import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Mic } from "lucide-react"
import type { ScheduledRoutine } from "../types/api"
import type { User, Child, Analysis } from "@/lib/api/types"
import { HomeView } from "./views/HomeView"
import { FamilyView } from "./views/FamilyView"
import { RecordingsView } from "./views/RecordingsView"
import { AlertsView } from "./views/AlertsView"
import { SettingsView } from "./views/SettingsView"
import { BottomNav } from "./BottomNav"
import { RecordingBar } from "./RecordingBar"
import { Button } from "@/components/ui/button"

type TabType = "home" | "family" | "records" | "alerts" | "settings"

export interface DashboardViewProps {
  user: User
  children: Child[]
  currentChild: Child
  lastSession: Analysis | null
  total: Analysis | null
  missedRecordings: Array<{ routine: string; scheduled_time: string }>
  routines: ScheduledRoutine[]
  onSwitchChild: (childId: string) => void
  onRecordingUpload: (file: File, duration: number) => Promise<void>
  onLogout: () => void
  onAddChild: () => void
  onRefresh: () => Promise<void>
}

export function DashboardView({
  user,
  children,
  currentChild,
  lastSession,
  total,
  missedRecordings,
  routines,
  onSwitchChild,
  onRecordingUpload,
  onLogout,
  onAddChild,
  onRefresh,
}: DashboardViewProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [activeTab, setActiveTabState] = useState<TabType>("home")

  // Sync state with URL on mount and param change
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["home", "family", "records", "alerts", "settings"].includes(tab)) {
      setActiveTabState(tab as TabType)
    }
  }, [searchParams])

  // Helper to update state and URL
  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const showRecordingBar = ["home", "family", "records"].includes(activeTab) && currentChild?.current_user_role !== "spectator"



  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {activeTab === "home" && (
        <HomeView
          user={user}
          currentChild={currentChild || null}
          lastSession={lastSession}
          total={total}
          missedRecordings={missedRecordings}
          onOpenRecording={() => { }}
          onLogout={onLogout}
          onNavigateToFamily={() => setActiveTab("family")}
        />
      )}

      {activeTab === "family" && (
        <FamilyView children={children} currentChild={currentChild} onSwitchChild={onSwitchChild} onAddChild={onAddChild} onRefresh={onRefresh} />
      )}

      {activeTab === "records" && (
        <RecordingsView currentChild={currentChild} />
      )}

      {activeTab === "alerts" && <AlertsView />}

      {activeTab === "settings" && (
        <SettingsView user={user} currentChild={currentChild} onLogout={onLogout} onRefresh={onRefresh} />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showRecordingBar && (
        <RecordingBar onUpload={onRecordingUpload} />
      )}
    </div>
  )
}
