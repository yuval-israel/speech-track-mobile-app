"use client"

import { useState } from "react"
import type { User, Child, Analysis } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { MissedRecordingAlert } from "../MissedRecordingAlert"
import { Plus } from "lucide-react"
import { MetricsCard } from "../MetricsCard"
import { useLanguage } from "@/contexts/language-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Category = 'General' | 'Interaction' | 'Vocabulary' | 'Sentences'


interface HomeViewProps {
  user: User
  currentChild: Child | null
  lastSession: Analysis | null
  total: Analysis | null
  missedRecordings: Array<{ routine: string; scheduled_time: string }>
  onOpenRecording: () => void
  onLogout: () => void
  onNavigateToFamily?: () => void
}

export function HomeView({
  user,
  currentChild,
  lastSession,
  total,
  missedRecordings,
  onOpenRecording,
  onLogout,
  onNavigateToFamily
}: HomeViewProps) {
  const { t, isRTL } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<Category>('Interaction')

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


  const renderMetricRow = (labelKey: string, valuePath: string, isChart = false, customValue?: (analysis: Analysis | null) => any) => {
    const getValue = (analysis: Analysis | null) => {
      if (customValue) return customValue(analysis)
      if (!analysis) return "N/A"
      const keys = valuePath.split('.')
      let val: any = analysis
      for (const key of keys) {
        val = val?.[key]
      }
      return val ?? "N/A"
    }

    const lastVal = getValue(lastSession)
    const globalVal = getValue(total)

    const formatValue = (v: any) => {
      if (v === "N/A") return v
      if (typeof v === 'number') {
        if (Number.isInteger(v)) return v.toString()
        return v.toFixed(2)
      }
      return v.toString()
    }

    // Trend calculation
    let trend: string | undefined = undefined
    let trendUp: boolean | undefined = undefined

    if (typeof lastVal === 'number' && typeof globalVal === 'number' && globalVal !== 0) {
      const diff = lastVal - globalVal
      const percent = (diff / globalVal) * 100
      trend = `${Math.abs(percent).toFixed(0)}%`
      trendUp = diff >= 0
    }

    return (
      <div key={labelKey} className="space-y-2">
        <label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isRTL ? "text-right block" : ""}`}>
          {t(labelKey)}
        </label>
        <div className={`grid grid-cols-2 gap-4 ${isRTL ? "rtl" : ""}`}>
          <MetricsCard
            title=""
            value={!isChart ? formatValue(lastVal) : ""}
            type={isChart ? "chart" : "text"}
            chartData={isChart ? lastVal : undefined}
            trend={!isChart ? trend : undefined}
            trendUp={!isChart ? trendUp : undefined}
            variant="tinted"
          />
          <MetricsCard
            title=""
            value={!isChart ? formatValue(globalVal) : ""}
            type={isChart ? "chart" : "text"}
            chartData={isChart ? globalVal : undefined}
          />
        </div>
      </div>
    )
  }

  const renderTurnCount = (analysis: Analysis | null) => {
    if (!analysis) return "-"
    if (analysis.interaction_analysis) {
      return analysis.interaction_analysis.turn_taking_patterns.reduce((sum, p) => sum + p.count, 0)
    }
    return analysis.interaction_aggregates?.total_turns_count ?? "-"
  }

  const renderInitiationValue = (analysis: Analysis | null) => {
    if (!analysis) return "-"
    return analysis.interaction_analysis?.initiation_rate['child']
      ?? analysis.interaction_aggregates?.total_initiations_child
      ?? "-"
  }

  const renderPOSChart = (analysis: Analysis | null) => {
    if (!analysis?.pos_distribution) return []
    const data = Object.entries(analysis.pos_distribution).map(([name, value]) => ({
      name,
      value
    }))
    return data
  }

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'Interaction':
        return (
          <div className="space-y-6">
            {renderMetricRow("מספר חילופי התורות", "", false, renderTurnCount)}
            {renderMetricRow("שיעור פתיחת אינטראקציות", "", false, renderInitiationValue)}
          </div>
        )
      case 'Vocabulary':
        return (
          <div className="space-y-6">
            {renderMetricRow("סך כל יחידות השפה", "total_tokens")}
            {renderMetricRow("מספר המילים השונות", "unique_tokens")}
            {renderMetricRow("מדד גיוון המילים", "ttr")}
          </div>
        )
      case 'Sentences':
        return (
          <div className="space-y-6">
            {renderMetricRow("מספר המילים הממוצע במשפט", "mlu")}
          </div>
        )
      case 'General':
        return (
          <div className="space-y-6">
            {renderMetricRow("מספר המילים הממוצע במשפט", "mlu")}
            {renderMetricRow("סך כל יחידות השפה", "total_tokens")}
            {renderMetricRow("מספר המילים השונות", "unique_tokens")}
          </div>
        )
      default:
        return null
    }
  }

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

      {/* Category Selector */}
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isRTL ? "text-right block w-full" : ""}`}>
          {isRTL ? "בחר מדד" : "Select Metric"}
        </label>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category)} dir={isRTL ? "rtl" : "ltr"}>
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General">{isRTL ? "כללי" : "General"}</SelectItem>
            <SelectItem value="Interaction">{isRTL ? "אינטראקציה" : "Interaction"}</SelectItem>
            <SelectItem value="Vocabulary">{isRTL ? "אוצר מילים" : "Vocabulary"}</SelectItem>
            <SelectItem value="Sentences">{isRTL ? "משפטים / MLU" : "Sentences"}</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Split View Header */}
      <div className={`grid grid-cols-2 gap-4 border-b border-border pb-2 ${isRTL ? "rtl" : ""}`}>
        <div className="text-center font-semibold text-sm">
          {isRTL ? "אימון אחרון" : "Last Session"}
        </div>
        <div className="text-center font-semibold text-sm">
          {isRTL ? "ממוצע / סה״כ" : "Total / Average"}
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {renderCategoryContent()}
      </div>

    </div>
  )
}
