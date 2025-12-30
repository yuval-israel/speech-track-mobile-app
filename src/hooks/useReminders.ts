import { useState, useEffect, useCallback } from 'react'
import { Reminder } from '@/src/types/api'

const STORAGE_KEY = 'speech-track-reminders'

export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setReminders(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse reminders", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage whenever reminders change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
        }
    }, [reminders, isLoaded])

    const addReminder = useCallback((reminder: Omit<Reminder, 'id'>) => {
        const newReminder: Reminder = {
            ...reminder,
            id: crypto.randomUUID()
        }
        setReminders(prev => [...prev, newReminder])
    }, [])

    const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    }, [])

    const deleteReminder = useCallback((id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id))
    }, [])

    const toggleReminder = useCallback((id: string) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    }, [])

    const generateCalendarUrl = useCallback((reminder: Reminder) => {
        // Base URL
        const baseUrl = new URL("https://calendar.google.com/calendar/render")
        baseUrl.searchParams.append("action", "TEMPLATE")
        baseUrl.searchParams.append("text", `SpeechTrack: ${reminder.label}`)
        baseUrl.searchParams.append("details", "Time for your speech practice session! Open SpeechTrack app to record.")

        // Time processing
        const [hours, minutes] = reminder.time.split(':').map(Number)

        // Calculate start time (Next occurrence)
        const now = new Date()
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0, 0)

        // If time passed today, move to tomorrow (simple logic, real recurrenchandling happens in RRULE)
        if (startDate < now) {
            startDate.setDate(startDate.getDate() + 1)
        }

        // Format dates as YYYYMMDDTHHMMSSZ (UTC) or local YYYYMMDDTHHMMSS
        // Google Calendar render link works best with ISO basic format without separators
        const formatTime = (date: Date) => date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

        const startStr = formatTime(startDate)
        const endDate = new Date(startDate.getTime() + 15 * 60000) // 15 mins later
        const endStr = formatTime(endDate)

        baseUrl.searchParams.append("dates", `${startStr}/${endStr}`)

        // Recurrence (RRULE)
        if (reminder.days.length > 0) {
            const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
            const selectedDays = reminder.days.map(d => dayMap[d]).join(',')
            baseUrl.searchParams.append("recur", `RRULE:FREQ=WEEKLY;BYDAY=${selectedDays}`)
        }

        return baseUrl.toString()
    }, [])

    return {
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        generateCalendarUrl,
        isLoaded
    }
}
