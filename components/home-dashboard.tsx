"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricsCard } from "./metrics-card"
import { MissedRecordingAlert } from "./missed-recording-alert"
import { ProfileSettings } from "./profile-settings"
import { useLanguage } from "@/contexts/language-context"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Mic, Settings } from "lucide-react"

interface HomeDashboardProps {
  onOpenKidSwitcher: () => void
  onStartRecording: () => void
  onLogout?: () => void
}

export function HomeDashboard({ onOpenKidSwitcher, onStartRecording, onLogout }: HomeDashboardProps) {
  const { t, isRTL } = useLanguage()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [missedRecording, setMissedRecording] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Mock data - replace with API calls
  const vocabularyData = [
    { name: "Week 1", value: 45 },
    { name: "Week 2", value: 58 },
    { name: "Week 3", value: 72 },
    { name: "Week 4", value: 89 },
  ]

  const interactionData = [
    { name: "Mon", value: 8 },
    { name: "Tue", value: 10 },
    { name: "Wed", value: 12 },
    { name: "Thu", value: 9 },
    { name: "Fri", value: 15 },
  ]

  if (isSettingsOpen) {
    return (
      <>
        <ProfileSettings type="parent" onClose={() => setIsSettingsOpen(false)} onLogout={onLogout} />
      </>
    )
  }

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="flex-1">
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div>
              <h1 className={`text-2xl font-bold ${isRTL ? "text-right" : ""}`}>Sarah's Hub</h1>
              <p className={`text-sm text-muted-foreground ${isRTL ? "text-right" : ""}`}>Welcome back!</p>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <Settings className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={onOpenKidSwitcher}
            className="relative h-12 w-12 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-lg hover:bg-accent/20 transition-colors"
          >
            👧
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`px-4 py-6 space-y-4 ${isRTL ? "rtl" : "ltr"}`}>
        <MissedRecordingAlert visible={missedRecording} onDismiss={() => setMissedRecording(false)} />

        {/* Quick Metrics */}
        <div className="space-y-2">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <h2 className={`text-lg font-semibold ${isRTL ? "text-right" : ""}`}>Language Metrics</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("language")}</span>
              <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <MetricsCard
              title={t("vocabulary_count")}
              value="342"
              description="Total unique words your child has used"
              type="text"
            />
            <MetricsCard
              title={t("mlu")}
              value="4.2"
              description="Average length of sentences your child produces"
              type="bar"
              chartData={interactionData}
            />
            <MetricsCard
              title={t("interaction_fluency")}
              value="87%"
              description="Percentage of fluent interactions during sessions"
              type="text"
            />
          </div>
        </div>

        {/* Advanced Analysis */}
        {showAdvanced && (
          <Card className="rounded-2xl border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-base">Advanced Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Detailed breakdown of language patterns</p>
              <div className="space-y-2">
                <div className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span>Nouns</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span>Verbs</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span>Adjectives</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span>Other</span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Routine */}
        <Card className="rounded-2xl border-muted bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Next Routine</CardTitle>
          </CardHeader>
          <CardContent className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
            <p className="text-lg font-semibold">Dinner Time</p>
            <p className="text-sm text-muted-foreground">Today at 19:00</p>
            <p className="text-xs text-muted-foreground">2 hours 45 minutes away</p>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onStartRecording}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-accent shadow-lg hover:bg-accent/90 transition-all flex items-center justify-center text-white z-50 hover:scale-110"
      >
        <Mic className="h-6 w-6" />
      </button>
    </div>
  )
}
