import type { ScheduledRoutine } from "../../types/api"
import { Clock, Calendar } from "lucide-react"

interface AlertsViewProps {
  routines: ScheduledRoutine[]
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AlertsView({ routines }: AlertsViewProps) {
  return (
    <div className="min-h-screen pb-24 p-6">
      <h1 className="text-2xl font-bold mb-6">Scheduled Routines</h1>

      <div className="space-y-3">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className={`rounded-2xl border p-4 ${
              routine.enabled ? "border-accent bg-accent/5" : "border-border opacity-50"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{routine.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{routine.time}</span>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs ${
                  routine.enabled ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {routine.enabled ? "Active" : "Paused"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                {routine.days.map((day) => (
                  <span key={day} className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    {dayNames[day]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
