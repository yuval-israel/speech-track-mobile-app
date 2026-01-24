"use client"

import { useState } from "react"
import { VoiceStampFlow } from "./voice-stamp-flow"
import { FamilyView } from "./family-view"
import { AlertsView } from "./alerts-view"
import { BottomNav } from "./bottom-nav"
import { HomeDashboard } from "./home-dashboard"

type TabType = "home" | "family" | "record" | "alerts"

interface MainDashboardProps {
  onLogout?: () => void
}

export function MainDashboard({ onLogout }: MainDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home")
  const [isKidSwitcherOpen, setIsKidSwitcherOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  return (
    <div className="min-h-screen bg-background pb-24">
      {activeTab === "home" && (
        <HomeDashboard
          onOpenKidSwitcher={() => setIsKidSwitcherOpen(true)}
          onStartRecording={() => setIsRecording(true)}
          onLogout={onLogout}
        />
      )}
      {activeTab === "family" && <FamilyView />}
      {activeTab === "record" && <VoiceStampFlow />}
      {activeTab === "alerts" && <AlertsView />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
