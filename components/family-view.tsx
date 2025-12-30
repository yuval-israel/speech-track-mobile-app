"use client"

import { Plus, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FamilyMember {
  id: string
  name: string
  role: "parent" | "child"
  voiceStampStatus: "active" | "missing"
}

export function FamilyView() {
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Sarah (You)", role: "parent", voiceStampStatus: "active" },
    { id: "2", name: "Emma", role: "child", voiceStampStatus: "active" },
    { id: "3", name: "Liam", role: "child", voiceStampStatus: "missing" },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background pb-24 pt-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Family</h1>
        <p className="text-muted-foreground text-sm">Manage voice profiles for your family</p>
      </div>

      {/* Family Members List */}
      <div className="space-y-3 mb-8">
        {members.map((member) => (
          <Card
            key={member.id}
            className="p-4 flex items-center justify-between hover:border-border/80 transition-colors cursor-pointer rounded-2xl"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-foreground">{member.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
              </div>
            </div>

            {/* Voice Stamp Badge */}
            {member.voiceStampStatus === "active" ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 rounded-full border border-teal-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-teal-700">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-orange-700">Missing</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Child Button */}
      <Button className="w-full h-11 rounded-2xl bg-gradient-to-r from-accent to-teal-500 hover:from-accent/90 hover:to-teal-600 text-white font-semibold flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        Add Child
      </Button>
    </div>
  )
}
