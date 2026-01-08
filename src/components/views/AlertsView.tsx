import { useState } from "react"
import { useReminders } from "../../hooks/useReminders"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Calendar, Clock, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const dayInitials = ["S", "M", "T", "W", "T", "F", "S"]

export function AlertsView() {
  const { reminders, addReminder, deleteReminder, toggleReminder, generateCalendarUrl } = useReminders()
  const [isOpen, setIsOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newTime, setNewTime] = useState("09:00")
  const [newEndTime, setNewEndTime] = useState("10:00")
  const [newDays, setNewDays] = useState<number[]>([])

  const handleAdd = () => {
    if (!newLabel || !newTime) return

    addReminder({
      label: newLabel,
      time: newTime,
      endTime: newEndTime,
      days: newDays,
      isEnabled: true
    })

    setIsOpen(false)
    setNewLabel("")
    setNewTime("09:00")
    setNewEndTime("10:00")
    setNewDays([])
  }

  const toggleDay = (dayIndex: number) => {
    setNewDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    )
  }

  return (
    <div className="min-h-screen pb-24 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Routine Reminders</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Set practice schedules for your child</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Routine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Routine</DialogTitle>
              <DialogDescription>
                Schedule a reminder for speech practice.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Label
                </Label>
                <Input
                  id="name"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Daily Practice"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Days</Label>
                <div className="col-span-3 flex gap-2 flex-wrap">
                  {dayInitials.map((initial, index) => {
                    const isSelected = newDays.includes(index)
                    return (
                      <button
                        key={index}
                        onClick={() => toggleDay(index)}
                        className={cn(
                          "h-8 w-8 rounded-full text-xs font-medium border transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50"
                        )}
                      >
                        {initial}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Save Routine</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No reminders yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              Create a routine to get consistent with speech practice.
            </p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4 gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-medium truncate", !reminder.isEnabled && "text-muted-foreground line-through decoration-slate-300 dark:decoration-slate-700")}>
                      {reminder.label}
                    </h4>
                    <div className="flex items-center text-sm text-muted-foreground mt-0.5 space-x-2">
                      <span>{reminder.time} {reminder.endTime && `- ${reminder.endTime}`}</span>
                      <span>•</span>
                      <span className="truncate">
                        {reminder.days.length === 0
                          ? "Once"
                          : reminder.days.length === 7
                            ? "Every Day"
                            : reminder.days.map(d => dayNames[d]).join(", ")}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={reminder.isEnabled}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                  />
                </div>

                {/* Actions Footer */}
                <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t flex items-center justify-end px-2 py-1 gap-1">
                  {reminder.isEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                      onClick={() => window.open(generateCalendarUrl(reminder), '_blank')}
                    >
                      <Calendar className="h-3 w-3 mr-1.5" />
                      Add to Calendar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
