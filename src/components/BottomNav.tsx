"use client"

import { Home, Users, FileAudio, Bell, Settings } from "lucide-react"

type TabType = "home" | "family" | "records" | "alerts" | "settings"

interface BottomNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home" as TabType, icon: Home, label: "Home" },
    { id: "family" as TabType, icon: Users, label: "Family" },
    { id: "records" as TabType, icon: FileAudio, label: "Records" },
    { id: "alerts" as TabType, icon: Bell, label: "Alerts" },
    { id: "settings" as TabType, icon: Settings, label: "Settings" },
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
