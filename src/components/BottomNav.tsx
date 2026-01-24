"use client"
import { useLanguage } from "@/contexts/language-context"

import { Home, Users, FileAudio, Bell, Settings } from "lucide-react"

type TabType = "home" | "family" | "records" | "alerts" | "settings"

interface BottomNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage()

  const tabs = [
    { id: "home" as TabType, icon: Home, label: t("nav.home") },
    { id: "family" as TabType, icon: Users, label: t("nav.family") },
    { id: "records" as TabType, icon: FileAudio, label: t("nav.recordings") },
    { id: "alerts" as TabType, icon: Bell, label: t("nav.alerts") },
    { id: "settings" as TabType, icon: Settings, label: t("nav.settings") },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-40">
      <div className="flex items-center justify-around h-20 px-2 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] px-2 py-2 rounded-xl transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className={`h-6 w-6 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : ""}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
