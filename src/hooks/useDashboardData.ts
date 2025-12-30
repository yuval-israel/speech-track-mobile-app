import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { UserOut, ChildOut, ChildGlobalAnalysisOut, adaptAnalysis, Analysis } from "@/lib/api/types"
import { DashboardData } from "@/src/types/api"

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requiresOnboarding, setRequiresOnboarding] = useState(false)

    const fetchData = useCallback(async (forcedChildId?: string) => {
        try {
            setLoading(true)
            setRequiresOnboarding(false)

            // 1. Get User
            const user = await apiFetch<UserOut>('/users/me')

            // 2. Get Children
            const children = await apiFetch<ChildOut[]>('/children/')

            if (children.length === 0) {
                setRequiresOnboarding(true)
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
            }

            // 4. Get Recordings History
            let recordings: any[] = []
            try {
                const fetchedRecordings = await apiFetch<any[]>(`/recordings/${currentChildId}`)
                recordings = fetchedRecordings
            } catch (e) {
                // Ignore
            }

            // Calculate weekly progress
            const now = new Date()
            const weeklyProgress = []

            for (let i = 6; i >= 0; i--) {
                const d = new Date(now)
                d.setDate(d.getDate() - i)
                const dateStr = d.toISOString().split('T')[0]

                // Filter recordings for this day
                const daysRecordings = recordings.filter(r => r.created_at.startsWith(dateStr))

                // Calculate metrics
                weeklyProgress.push({
                    date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    mlu: 0,
                    tokens: daysRecordings.length
                })
            }

            const dashboardData: DashboardData = {
                user: {
                    id: user.id.toString(),
                    email: user.username,
                    full_name: user.username
                },
                children: children.map(c => ({
                    id: c.id.toString(),
                    name: c.name,
                    birthdate: c.birthdate,
                    gender: c.gender,
                })),
                currentChild: {
                    id: currentChild.id.toString(),
                    name: currentChild.name,
                    birthdate: currentChild.birthdate,
                    gender: currentChild.gender,
                },
                latestAnalysis: analysis,
                weeklyProgress: weeklyProgress,
                missedRecordings: [], // Mock
                routines: [] // Mock
            }

            setData(dashboardData)
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

    return { data, loading, error, refetch: fetchData, requiresOnboarding }
}
