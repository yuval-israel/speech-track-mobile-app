"use client"

import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChildCreate } from "@/lib/api/types"

interface FamilySetupStepProps {
  data: Partial<ChildCreate>
  onChange: (data: Partial<ChildCreate>) => void
}

export function FamilySetupStep({ data, onChange }: FamilySetupStepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Child's Name</label>
        <Input
          placeholder="Enter child's name"
          value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="rounded-xl h-11"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Date of Birth</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
          <Input
            type="date"
            value={data.birthdate || ""}
            onChange={(e) => onChange({ ...data, birthdate: e.target.value })}
            className="pl-10 rounded-xl h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Gender</label>
        <div className="grid grid-cols-2 gap-2">
          {["Boy", "Girl"].map((option) => {
            return (
              <Button
                key={option}
                variant={data.gender === (option === "Boy" ? "male" : "female") ? "default" : "outline"}
                onClick={() => onChange({ ...data, gender: option === "Boy" ? "male" : "female" })}
                className="rounded-xl"
              >
                {option}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Accurate information helps us track development milestones more effectively.
        </p>
      </div>
    </div>
  )
}
