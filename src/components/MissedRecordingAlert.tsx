"use client"

import { X, AlertCircle } from "lucide-react"

interface MissedRecordingAlertProps {
  routine: string
  scheduledTime: string
  onDismiss?: () => void
  onRecord?: () => void
}

export function MissedRecordingAlert({ routine, scheduledTime, onDismiss, onRecord }: MissedRecordingAlertProps) {
  return (
    <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Missed Recording: {routine}</p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Scheduled for {scheduledTime}</p>
          {onRecord && (
            <button
              onClick={onRecord}
              className="mt-2 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 underline"
            >
              Record Now
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
