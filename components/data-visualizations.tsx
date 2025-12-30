"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const COLORS = {
  accent: "hsl(var(--accent))",
  primary: "hsl(var(--primary))",
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
}

// Parts of Speech Distribution
const posData = [
  { name: "Nouns", value: 35 },
  { name: "Verbs", value: 25 },
  { name: "Adjectives", value: 18 },
  { name: "Adverbs", value: 12 },
  { name: "Other", value: 10 },
]

// Weekly progression
const weeklyData = [
  { day: "Mon", tokens: 120, interactions: 8 },
  { day: "Tue", tokens: 145, interactions: 10 },
  { day: "Wed", tokens: 132, interactions: 9 },
  { day: "Thu", tokens: 178, interactions: 12 },
  { day: "Fri", tokens: 195, interactions: 14 },
  { day: "Sat", tokens: 210, interactions: 15 },
  { day: "Sun", tokens: 188, interactions: 13 },
]

// Monthly trend
const monthlyData = [
  { week: "Week 1", vocabulary: 120, fluency: 65 },
  { week: "Week 2", vocabulary: 145, fluency: 70 },
  { week: "Week 3", vocabulary: 168, fluency: 75 },
  { week: "Week 4", vocabulary: 195, fluency: 82 },
]

export function POSDistributionChart() {
  const { isRTL } = useLanguage()
  const posColors = [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.accent]

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className={`text-base ${isRTL ? "text-right" : ""}`}>Parts of Speech Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={posData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {posData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={posColors[index % posColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function WeeklyProgressChart() {
  const { isRTL } = useLanguage()

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className={`text-base ${isRTL ? "text-right" : ""}`}>Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="tokens" fill={COLORS.chart1} radius={[8, 8, 0, 0]} name="Tokens" />
            <Bar dataKey="interactions" fill={COLORS.chart2} radius={[8, 8, 0, 0]} name="Interactions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function MonthlyTrendChart() {
  const { isRTL } = useLanguage()

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className={`text-base ${isRTL ? "text-right" : ""}`}>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="vocabulary"
              stroke={COLORS.chart1}
              strokeWidth={2}
              dot={{ fill: COLORS.chart1, r: 4 }}
              name="Vocabulary"
            />
            <Line
              type="monotone"
              dataKey="fluency"
              stroke={COLORS.chart2}
              strokeWidth={2}
              dot={{ fill: COLORS.chart2, r: 4 }}
              name="Fluency %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function DataVisualizationDashboard() {
  const { isRTL } = useLanguage()

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 ${isRTL ? "text-right" : ""}`}
      >
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>

      <div className={`px-4 py-6 space-y-4 ${isRTL ? "rtl" : "ltr"}`}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold text-primary mt-1">1,342</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-gradient-to-br from-chart-2/10 to-chart-2/5">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Avg MLU</p>
              <p className="text-2xl font-bold text-chart-2 mt-1">4.8</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <POSDistributionChart />
        <WeeklyProgressChart />
        <MonthlyTrendChart />
      </div>
    </div>
  )
}
