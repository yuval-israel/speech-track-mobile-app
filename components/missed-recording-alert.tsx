"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface MissedRecordingAlertProps {
  visible: boolean
  onDismiss?: () => void
}

export function MissedRecordingAlert({ visible, onDismiss }: MissedRecordingAlertProps) {
  const { t, isRTL } = useLanguage()

  if (!visible) return null

  return (
    <div className="relative">
      <Alert
        variant="destructive"
        className={`rounded-2xl border-orange-200 bg-orange-50 text-orange-800 ${isRTL ? "text-right" : ""}`}
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("missed_recording")}</AlertDescription>
        {onDismiss && (
          <button onClick={onDismiss} className="absolute top-2 right-2 text-orange-600 hover:text-orange-900">
            <X className="h-4 w-4" />
          </button>
        )}
      </Alert>
    </div>
  )
}
