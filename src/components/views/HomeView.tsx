"use client"

import { useState } from "react"
import type { User, Child, Analysis } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MetricsCard } from "../MetricsCard"
import { MissedRecordingAlert } from "../MissedRecordingAlert"
import { ProfileSettings } from "../ProfileSettings"
import { Plus } from "lucide-react"

// Recharts imports for the graph
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell } from "recharts"

interface HomeViewProps {
  user: User
  currentChild: Child | null
  analysis: Analysis | null
  weeklyProgress: Array<{ date: string; mlu: number; tokens: number }>
  missedRecordings: Array<{ routine: string; scheduled_time: string }>
  onOpenRecording: () => void
  onLogout: () => void
  onNavigateToFamily?: () => void
}

export function HomeView({
  user,
  currentChild,
  analysis,
  weeklyProgress,
  missedRecordings,
  onOpenRecording,
  onLogout,
  onNavigateToFamily
}: HomeViewProps) {

  // Empty State
  if (!currentChild) {
    return (
      <div className="p-4 space-y-6 pb-24 flex flex-col h-[80vh] items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Welcome to SpeechTrack, {user.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">
            Get started by creating a profile for your child to track their speech development.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={onNavigateToFamily}
              size="lg"
              className="rounded-full shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Child Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Prepare data for POS chart
  const posData = analysis?.pos_distribution
    ? Object.entries(analysis.pos_distribution).map(([name, value]) => ({ name, value }))
    : []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hi, {user.full_name?.split(" ")[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here's how {currentChild.name} is doing</p>
        </div>

      </div>

      <div className="space-y-2">
        {missedRecordings.map((missed, index) => (
          <MissedRecordingAlert
            key={index}
            routineName={missed.routine}
            scheduledTime={missed.scheduled_time}
            onRecord={onOpenRecording}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricsCard
          title="Daily Words"
          value={analysis?.total_tokens.toString() || "0"}
          trend="+12%"
          trendUp={true}
        />
        <MetricsCard
          title="Avg. MLU"
          value={analysis?.mlu.toFixed(1) || "0.0"}
          trend="+0.3"
          trendUp={true}
        />
        <MetricsCard
          title="Unique Words"
          value={analysis?.unique_tokens.toString() || "0"}
          trend="+8"
          trendUp={true}
        />
        <MetricsCard
          title="Fluency Score"
          value={analysis?.fluency_score ? analysis.fluency_score.toFixed(1) : "N/A"}
          trend="Stable"
          trendUp={true}
        />
      </div>

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-none overflow-hidden relative">
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">Ready to record?</CardTitle>
              <p className="text-primary-foreground/90 mb-6 max-w-[200px]">
                Capture {currentChild.name}'s next milestone.
              </p>
              <Button
                onClick={onOpenRecording}
                variant="secondary"
                size="lg"
                className="rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Recording
              </Button>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
              <div className="h-40 w-40 rounded-full bg-white blur-2xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>MLU Tracking over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="colorMlu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="mlu"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMlu)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* POS Distribution Chart (Moved from Data View) */}
      {posData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Speech Composition</CardTitle>
            <CardDescription>Distribution by Part of Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={posData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {posData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  )
}
