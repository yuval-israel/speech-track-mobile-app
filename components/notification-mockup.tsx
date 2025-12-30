"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface NotificationMockupProps {
  time: string
  message: string
  onSnooze: () => void
  onDismiss: () => void
}

export function NotificationMockup({ time, message, onSnooze, onDismiss }: NotificationMockupProps) {
  const { t, isRTL } = useLanguage()

  return (
    <Card className={`rounded-2xl bg-accent/10 border border-accent shadow-lg max-w-sm ${isRTL ? "rtl" : "ltr"}`}>
      <CardContent className="pt-4">
        <div className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
            <p className="font-semibold text-sm">SpeechTrack Reminder</p>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
            <p className="text-xs text-muted-foreground mt-2">{time}</p>
          </div>
          <button onClick={onDismiss} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className={`flex gap-2 mt-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button onClick={onSnooze} variant="outline" size="sm" className="flex-1 rounded-full bg-transparent">
            {t("snooze")}
          </Button>
          <Button onClick={onDismiss} size="sm" className="flex-1 rounded-full bg-accent hover:bg-accent/90">
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
