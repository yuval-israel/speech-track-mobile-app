"use client"

import { Mic, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function HomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold">
            L
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
              <h2 className="font-semibold text-foreground">Liam</h2>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Record Button */}
      <div className="px-4 mb-8">
        <Button
          size="lg"
          className="w-full h-24 rounded-2xl text-lg font-semibold bg-gradient-to-br from-accent to-teal-500 hover:from-accent/90 hover:to-teal-600 text-white"
        >
          <Mic className="w-8 h-8 mr-3" />
          Record Interaction
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="px-4 space-y-3">
        <h3 className="font-semibold text-foreground">This Week</h3>

        <Card className="p-4 rounded-2xl">
          <p className="text-sm text-muted-foreground mb-2">Weekly Word Count</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent">342</span>
            <span className="text-sm text-green-600">+18%</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl">
          <p className="text-sm text-muted-foreground mb-2">MLU (Mean Length of Utterance)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent">2.8</span>
            <span className="text-sm text-green-600">+0.3</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl">
          <p className="text-sm text-muted-foreground mb-2">Interaction Fluency</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent">87%</span>
            <span className="text-sm text-green-600">+5%</span>
          </div>
        </Card>

        {/* Expert Tip */}
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200 mt-6">
          <p className="text-sm font-medium text-foreground mb-2">Expert Insight</p>
          <p className="text-sm text-muted-foreground">
            Liam used 20% more verbs today! This shows growing verb complexity in sentences.
          </p>
        </Card>
      </div>
    </div>
  )
}
