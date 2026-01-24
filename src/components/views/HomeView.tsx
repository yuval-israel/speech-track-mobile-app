"use client"

import { useState } from "react"
import type { User, Child, Analysis } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GaugeChart } from "../GaugeChart"
import { MissedRecordingAlert } from "../MissedRecordingAlert"
import { ProfileSettings } from "../ProfileSettings"
import { Plus, MessageSquare, Heart } from "lucide-react"
import { MetricsCard } from "../MetricsCard"
import { useLanguage } from "@/contexts/language-context"

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
  const { t, isRTL } = useLanguage()

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

  // Calculate Interaction Metrics
  const turnExchanges = analysis?.interaction_analysis?.turn_taking_patterns.reduce((sum, p) => sum + p.count, 0) || 0
  const initiationCount = analysis?.interaction_analysis?.initiation_rate['child'] || 0

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
            routine={missed.routine}
            scheduledTime={missed.scheduled_time}
            onRecord={onOpenRecording}
          />
        ))}
      </div>

      <div className="space-y-6">
        <GaugeChart
          label={t("metrics.mlu")}
          value={analysis?.mlu || 0}
          max={5.0}
          color="#0ea5e9" // Sky 500
          subtext={analysis?.mlu ? "Your child is on track for their age group." : "No data available yet."}
          icon={<MessageSquare className="h-5 w-5" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <MetricsCard
            title={t("metrics.total_tokens")}
            value={(analysis?.total_tokens || 0).toString()}
          />
          <MetricsCard
            title={t("metrics.unique_words")}
            value={(analysis?.unique_tokens || 0).toString()}
          />
          <MetricsCard
            title={t("metrics.turn_distribution")}
            value={turnExchanges.toString()}
          />
          <MetricsCard
            title={t("metrics.initiation_ratio")}
            value={initiationCount.toString()}
          />
          <MetricsCard
            title={t("metrics.ttr")}
            value={(analysis?.ttr || 0).toFixed(2)}
          />
        </div>

        <GaugeChart
          label="Interaction & Fluency"
          value={(analysis?.fluency_score || 0) / 10}
          max={10.0}
          color="#8b5cf6" // Violet 500
          subtext="Fluency interaction score based on recent recordings."
          icon={<Heart className="h-5 w-5" />}
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
          <CardTitle className={isRTL ? "text-right" : ""}>{t("nav.home")} - Weekly Progress</CardTitle>
          <CardDescription className={isRTL ? "text-right" : ""}>{t("metrics.mlu")} Tracking over time</CardDescription>
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
            <CardTitle className={isRTL ? "text-right" : ""}>{t("metrics.pos")}</CardTitle>
            <CardDescription className={isRTL ? "text-right" : ""}>Distribution by Part of Speech</CardDescription>
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
