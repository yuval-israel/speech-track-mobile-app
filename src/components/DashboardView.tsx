import { useState } from "react"
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
  analysis: Analysis | null
  weeklyProgress: Array<{ date: string; mlu: number; tokens: number }>
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
  analysis,
  weeklyProgress,
  missedRecordings,
  routines,
  onSwitchChild,
  onRecordingUpload,
  onLogout,
  onAddChild,
  onRefresh,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home")

  const showRecordingBar = ["home", "family", "records"].includes(activeTab)



  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {activeTab === "home" && (
        <HomeView
          user={user}
          currentChild={currentChild || null}
          analysis={analysis}
          weeklyProgress={weeklyProgress}
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
