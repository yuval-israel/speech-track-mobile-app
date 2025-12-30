"use client"

import { Clock, Tag, X, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Routine {
  id: string
  name: string
  time: string
  daysOfWeek: string[]
}

export function AlertsView() {
  const [routines, setRoutines] = useState<Routine[]>([
    { id: "1", name: "Bath Time", time: "19:00", daysOfWeek: ["Mon", "Wed", "Fri", "Sun"] },
    { id: "2", name: "Breakfast", time: "08:00", daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: "3", name: "Dinner", time: "18:30", daysOfWeek: ["Daily"] },
  ])

  const [showScheduler, setShowScheduler] = useState(false)
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const tagSuggestions = ["Breakfast", "Lunch", "Dinner", "Snack", "Bath Time", "Bedtime", "Playtime"]
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
    // Auto-set time based on tag
    const timeMap: Record<string, string> = {
      Breakfast: "08:00",
      Lunch: "12:00",
      Dinner: "18:30",
      Snack: "15:00",
      "Bath Time": "19:00",
      Bedtime: "20:00",
      Playtime: "16:00",
    }
    setSelectedTime(timeMap[tag] || "")
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background pb-24 pt-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Alerts</h1>
        <p className="text-muted-foreground text-sm">Schedule recording reminders for your routines</p>
      </div>

      {/* Scheduled Routines */}
      <div className="space-y-3 mb-8">
        {routines.map((routine) => (
          <Card key={routine.id} className="p-4 rounded-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">{routine.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{routine.time}</span>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {routine.daysOfWeek.map((day) => (
                <span key={day} className="text-xs font-semibold px-2 py-1 bg-muted text-foreground/70 rounded-full">
                  {day}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Smart Scheduler Form */}
      <Card className="p-6 rounded-2xl">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-accent" />
          Smart Scheduler
        </h2>

        {/* Tag Selection */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Select a routine</p>
          <div className="flex flex-wrap gap-2">
            {tagSuggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTag === tag ? "bg-accent text-white" : "bg-muted text-foreground/70 hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Time Display */}
        {selectedTime && (
          <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Auto-set time</p>
            <p className="text-lg font-bold text-blue-900 mt-1">{selectedTime}</p>
          </div>
        )}

        {/* Days Selection */}
        {selectedTag && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Repeat on</p>
            <div className="grid grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedDays.includes(day)
                      ? "bg-accent text-white"
                      : "bg-muted text-foreground/70 hover:bg-muted/80"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          className="w-full rounded-xl bg-gradient-to-r from-accent to-teal-500 hover:from-accent/90 hover:to-teal-600 text-white font-semibold h-11 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedTag || selectedDays.length === 0}
        >
          <Plus className="w-5 h-5" />
          Add to Schedule
        </Button>
      </Card>
    </div>
  )
}
