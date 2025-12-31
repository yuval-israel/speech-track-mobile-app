import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { UserOut, ChildOut, ChildGlobalAnalysisOut, adaptAnalysis, Analysis } from "@/lib/api/types"
import { DashboardData } from "@/src/types/api"

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [partialErrors, setPartialErrors] = useState<Record<string, string>>({})

    const fetchData = useCallback(async (forcedChildId?: string) => {
        try {
            setLoading(true)
            const currentPartialErrors: Record<string, string> = {}

            // 1. Get User
            const user = await apiFetch<UserOut>('/users/me')

            // 2. Get Children
            const children = await apiFetch<ChildOut[]>('/children/')

            // If no children, we still want to show the dashboard (empty state)
            if (children.length === 0) {
                const dashboardData: DashboardData = {
                    user: {
                        id: user.id.toString(),
                        email: user.username,
                        full_name: user.username,
                        has_voice_profile: user.has_voice_profile
                    },
                    children: [],
                    currentChild: null as any, // Handled by DashboardView null check
                    latestAnalysis: null,
                    weeklyProgress: [],
                    missedRecordings: [],
                    routines: []
                }
                setData(dashboardData)
                setPartialErrors({})
                setLoading(false)
                return
            }

            const currentChildId = forcedChildId || children[0].id.toString()
            const currentChild = children.find(c => c.id.toString() === currentChildId) || children[0]

            // 3. Get Analysis for current child
            let analysis: Analysis | null = null;
            try {
                const globalAnalysis = await apiFetch<ChildGlobalAnalysisOut>(`/analysis/children/${currentChildId}/global`)
                analysis = adaptAnalysis(globalAnalysis)
            } catch (e) {
                console.warn("Could not fetch analysis", e)
                currentPartialErrors.analysis = 'Failed to load analysis'
            }

            // 4. Get Recordings History
            let recordings: any[] = []
            try {
                const fetchedRecordings = await apiFetch<any[]>(`/recordings/${currentChildId}`)
                recordings = fetchedRecordings
            } catch (e) {
                console.warn("Could not fetch recordings", e)
                // We don't mark this as a partial error necessarily, or maybe we should?
                // For now, following logic that if recordings fail, we assume empty.
            }

            // Calculate weekly progress
            const now = new Date()
            const weeklyProgress = []
            const todayStr = toISODateString(now)

            for (let i = 6; i >= 0; i--) {
                const d = new Date(now)
                d.setDate(d.getDate() - i)
                const dateStr = toISODateString(d);

                // Filter recordings for this day
                // Date format from backend might vary, but usually ISO ish.
                // Assuming fetchedRecordings[].created_at is ISO string.
                const daysRecordings = recordings.filter(r => r.created_at.startsWith(dateStr))

                // Calculate metrics
                weeklyProgress.push({
                    date: dateStr,
                    mlu: 0,
                    tokens: daysRecordings.length
                })
            }

            // Calculate missed recordings
            // Check if there is a recording for today
            const hasRecordedToday = recordings.some(r => r.created_at.startsWith(todayStr))
            const missedRecordings = !hasRecordedToday ? [{
                routine: 'Daily Practice',
                scheduled_time: 'Today'
            }] : [];


            const dashboardData: DashboardData = {
                user: {
                    id: user.id.toString(),
                    email: user.username,
                    full_name: user.username,
                    has_voice_profile: user.has_voice_profile
                },
                children: children.map(c => ({
                    id: c.id.toString(),
                    name: c.name,
                    birthdate: c.birthdate,
                    gender: c.gender,
                    current_user_role: c.current_user_role,
                })),
                currentChild: {
                    id: currentChild.id.toString(),
                    name: currentChild.name,
                    birthdate: currentChild.birthdate,
                    gender: currentChild.gender,
                    current_user_role: currentChild.current_user_role,
                },
                latestAnalysis: analysis,
                weeklyProgress: weeklyProgress,
                missedRecordings: missedRecordings,
                routines: [] // Mock
            }

            setData(dashboardData)
            setPartialErrors(currentPartialErrors)
            setError(null)
            setLoading(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data")
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, partialErrors, refetch: fetchData }
}
