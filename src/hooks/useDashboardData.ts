import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { UserOut, ChildOut, ChildGlobalAnalysisOut, RecordingAnalysis, ChildGlobalAnalysis, adaptAnalysis, Analysis } from "@/lib/api/types"
import { DashboardData } from "@/src/types/api"

const toISODateString = (date: Date) => date.toISOString().split('T')[0];

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [partialErrors, setPartialErrors] = useState<Record<string, string>>({})
    const [latest, setLatest] = useState<RecordingAnalysis | null>(null)
    const [global, setGlobal] = useState<ChildGlobalAnalysis | null>(null)

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
                    lastSession: null,
                    total: null,
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

            // 3. Get Recordings History (Used for weekly progress)
            let recordings: any[] = []
            try {
                recordings = await apiFetch<any[]>(`/recordings/${currentChildId}`)
            } catch (e) {
                console.warn("Could not fetch recordings", e)
            }

            // 4. Fetch Analysis in Parallel
            let lastSession: Analysis | null = null;
            let total: Analysis | null = null;

            try {
                const [latestData, globalData] = await Promise.all([
                    apiFetch<RecordingAnalysis>(`/analysis/children/${currentChildId}/latest`).catch(e => {
                        // Handle 404 gracefully - it just means no recordings are ready yet
                        if (e.message.includes("404") || e.message.includes("not found")) {
                            return null;
                        }
                        console.warn("Latest analysis fetch failed", e);
                        return null;
                    }),
                    apiFetch<ChildGlobalAnalysis>(`/analysis/children/${currentChildId}/global`).catch(e => {
                        console.warn("Global analysis fetch failed", e);
                        currentPartialErrors.analysis = 'Failed to load analysis';
                        return null;
                    })
                ]);

                setLatest(latestData);
                setGlobal(globalData);

                if (latestData) lastSession = adaptAnalysis(latestData);
                if (globalData) total = adaptAnalysis(globalData);
            } catch (e) {
                console.error("Critical parallel fetch error", e);
            }

            const now = new Date()
            const todayStr = toISODateString(now)

            // Calculate missed recordings
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
                lastSession: lastSession,
                total: total,
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

    return { global, latest, data, loading, error, partialErrors, refetch: fetchData }
}
