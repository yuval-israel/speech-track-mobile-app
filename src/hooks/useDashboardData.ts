import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { UserOut, ChildOut, ChildGlobalAnalysisOut, adaptAnalysis, Analysis } from "@/lib/api/types"
import { DashboardData } from "@/types/api" // Import original type for compatibility with components

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async (forcedChildId?: string) => {
        try {
            setLoading(true)

            // 1. Get User
            const user = await apiFetch<UserOut>('/users/me')

            // 2. Get Children
            const children = await apiFetch<ChildOut[]>('/children/')

            if (children.length === 0) {
                // Handle case with no children
                // We can't really construct full DashboardData without a child
                // But for now let's might throw or return partial. 
                // DashboardContainer expects valid data. 
                // We'll throw an error or handle in UI. 
                // Let's return null data but no error, needing a setup flow.
                throw new Error("No children found. Please register a child.")
            }

            const currentChildId = forcedChildId || children[0].id.toString()
            const currentChild = children.find(c => c.id.toString() === currentChildId) || children[0]

            // 3. Get Analysis for current child
            // /analysis/children/{child_id}/global
            let analysis: Analysis | null = null;
            try {
                const globalAnalysis = await apiFetch<ChildGlobalAnalysisOut>(`/analysis/children/${currentChildId}/global`)
                analysis = adaptAnalysis(globalAnalysis)
            } catch (e) {
                // Analysis might not exist yet
                console.warn("Could not fetch analysis", e)
            }

            // Mock other data needed for DashboardData interface
            const dashboardData: any = {
                user: {
                    id: user.id.toString(),
                    fullName: user.username,  // Mapping username to fullName as per User interface in types/api.ts which has full_name?
                    // Wait, types/api User has: id, email, full_name. UserOut has: id, username.
                    // I need to adapt UserOut to User.
                    email: user.username, // Using username as email/name
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
                weeklyProgress: [], // Mock
                missedRecordings: [], // Mock
                routines: [] // Mock
            }

            setData(dashboardData)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch: fetchData }
}
