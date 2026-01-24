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
  const [selectedCategory, setSelectedCategory] = useState<Category>('General')

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

  const renderMetricValue = (analysis: Analysis | null, field: string) => {
    if (!analysis) return null

    const childName = currentChild?.name?.toLowerCase() || 'child'

    switch (field) {
      case 'turns':
        // If we have local patterns, sum them. Otherwise look at aggregates.
        if (analysis.interaction_analysis?.turn_taking_patterns) {
          return analysis.interaction_analysis.turn_taking_patterns.reduce((sum, p) => sum + p.count, 0)
        }
        return analysis.interaction_aggregates?.total_turns_count ?? 0
      case 'initiations':
        // First try finding by name (case insensitive), then by generic 'child'
        if (analysis.interaction_analysis?.initiation_rate) {
          const rates = analysis.interaction_analysis.initiation_rate
          const key = Object.keys(rates).find(k => k.toLowerCase() === childName) || 'child'
          return rates[key] ?? 0
        }
        return analysis.interaction_aggregates?.total_initiations_child ?? 0
      case 'tokens':
        return analysis.total_tokens
      case 'types':
        return analysis.unique_tokens
      case 'mlu':
        return analysis.mlu?.toFixed(2)
      case 'wpm':
        return analysis.speech?.overall_wpm_including_pauses?.toFixed(1) || 0
      default:
        return 0
    }
  }

  const renderMetric = (labelKey: string, field: string) => {
    const lastVal = renderMetricValue(lastSession, field)
    const totalVal = renderMetricValue(total, field)

    return (
      <div key={labelKey} className="space-y-2">
        <label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isRTL ? "text-right block" : ""}`}>
          {t(labelKey)}
        </label>
        <div className={`grid grid-cols-2 gap-4 ${isRTL ? "rtl" : ""}`}>
          {/* Right Column: Last Session */}
          <div className="flex flex-col">
            {lastSession ? (
              <MetricsCard
                title=""
                value={lastVal !== null ? lastVal : "0"}
                variant="tinted"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/30 rounded-2xl border border-dashed border-muted p-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  {isRTL ? "אין הקלטות עדיין" : "No recordings yet"}
                </p>
              </div>
            )}
          </div>

          {/* Left Column: Total */}
          <div className="flex flex-col">
            <MetricsCard
              title=""
              value={totalVal !== null ? totalVal : "0"}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'Interaction':
        return (
          <div className="space-y-6">
            {renderMetric("metrics.turn_distribution", 'turns')}
            {renderMetric("metrics.initiation_ratio", 'initiations')}
          </div>
        )
      case 'Vocabulary':
        return (
          <div className="space-y-6">
            {renderMetric("metrics.total_tokens", 'tokens')}
            {renderMetric("metrics.unique_words", 'types')}
          </div>
        )
      case 'Sentences':
        return (
          <div className="space-y-6">
            {renderMetric("metrics.mlu", 'mlu')}
            {renderMetric("WPM", 'wpm')}
          </div>
        )
      case 'General':
      default:
        return (
          <div className="space-y-6">
            {renderMetric("metrics.turn_distribution", 'turns')}
            {renderMetric("metrics.total_tokens", 'tokens')}
            {renderMetric("metrics.mlu", 'mlu')}
          </div>
        )
    }
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isRTL ? "היי" : "Hi"}, {user.full_name?.split(" ")[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isRTL ? `הנה מה שחדש אצל ${currentChild.name}` : `Here's how ${currentChild.name} is doing`}
          </p>
        </div>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isRTL ? "text-right block w-full" : ""}`}>
          {isRTL ? "בחר מדד" : "Select Category"}
        </label>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category)} dir={isRTL ? "rtl" : "ltr"}>
          <SelectTrigger className="w-full rounded-xl bg-background border-muted shadow-sm hover:bg-accent/5 transition-colors">
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

      {/* Missed Recordings */}
      {missedRecordings.length > 0 && (
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
      )}

      {/* Split View Header */}
      <div className={`grid grid-cols-2 gap-4 border-b border-muted pb-2 ${isRTL ? "rtl" : ""}`}>
        <div className="text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {isRTL ? "אימון אחרון" : "Last Session"}
          </span>
        </div>
        <div className="text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {isRTL ? "ממוצע / סה״כ" : "Total / Average"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {renderCategoryContent()}
      </div>

    </div>
  )
}
