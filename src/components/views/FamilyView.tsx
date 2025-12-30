"use client"

import type { Child } from "../../types/api"
import { Check, Plus } from "lucide-react"

interface FamilyViewProps {
  children: Child[]
  currentChild: Child
  onSwitchChild: (childId: string) => void
  onAddChild: () => void
}

export function FamilyView({ children, currentChild, onSwitchChild, onAddChild }: FamilyViewProps) {
  return (
    <div className="min-h-screen pb-24 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Family Members</h1>
      </div>

      <div className="space-y-3">
        {children.map((child) => {
          const isActive = child.id === currentChild.id

          return (
            <button
              key={child.id}
              onClick={() => onSwitchChild(child.id)}
              className={`w-full rounded-2xl border p-4 flex items-center gap-4 transition-colors
                ${isActive ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50"}`}
            >
              <img
                src={child.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`}
                alt={child.name}
                className="h-12 w-12 rounded-full"
              />
              <div className="flex-1 text-left">
                <p className="font-medium">{child.name}</p>
                <p className="text-sm text-muted-foreground">Born: {child.birthdate}</p>
              </div>
              {isActive && <Check className="h-5 w-5 text-accent" />}
            </button>
          )
        })}

        <button
          onClick={onAddChild}
          className="w-full rounded-2xl border border-dashed border-muted-foreground/30 p-4 flex items-center justify-center gap-2 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Child</span>
        </button>
      </div>
    </div>
  )
}
