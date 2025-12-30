"use client"

import { Home, Users, Mic, BarChart3, Bell } from "lucide-react"

interface BottomNavProps {
  activeTab: "home" | "family" | "record" | "data" | "alerts"
  onTabChange: (tab: "home" | "family" | "record" | "data" | "alerts") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "family", label: "Family", icon: Users },
    { id: "record", label: "Record", icon: Mic, isFab: true },
    { id: "data", label: "Data", icon: BarChart3 },
    { id: "alerts", label: "Alerts", icon: Bell },
  ] as const

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 flex items-center justify-around max-w-md mx-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        if (item.isFab) {
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 -mt-12"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-teal-500 hover:from-accent/90 hover:to-teal-600 shadow-lg flex items-center justify-center text-white transition-all">
                <Icon className="w-6 h-6" />
              </div>
            </button>
          )
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors"
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium ${isActive ? "text-accent" : "text-muted-foreground"}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
