"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Plus, Check, Upload } from "lucide-react"

interface Child {
  id: string
  name: string
  emoji: string
  birthDate: string
}

interface KidSwitcherModalProps {
  open: boolean
  onClose: () => void
  children: Child[]
  currentChildId: string
  onSelectChild: (id: string) => void
}

export function KidSwitcherModal({ open, onClose, children, currentChildId, onSelectChild }: KidSwitcherModalProps) {
  const { t, isRTL } = useLanguage()
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildName, setNewChildName] = useState("")
  const [newChildPhoto, setNewChildPhoto] = useState("👧")

  const handleSelectChild = (id: string) => {
    onSelectChild(id)
    onClose()
  }

  const handleAddChild = () => {
    if (newChildName.trim()) {
      console.log("Adding child:", newChildName, "with photo:", newChildPhoto)
      setNewChildName("")
      setNewChildPhoto("👧")
      setShowAddChild(false)
      onClose()
    }
  }

  const handlePhotoUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          console.log("Photo uploaded for new child")
          // Photo preview can be stored in state if needed
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-sm rounded-3xl ${isRTL ? "rtl" : "ltr"}`}>
        <DialogHeader className={isRTL ? "text-right" : ""}>
          <DialogTitle>Select Child</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Current Children List */}
          {children.length > 0 && (
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    currentChildId === child.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50 hover:bg-accent/5"
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="text-3xl">{child.emoji}</div>
                    <div className={isRTL ? "text-right" : ""}>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-muted-foreground">{child.birthDate}</p>
                    </div>
                  </div>
                  {currentChildId === child.id && <Check className="h-5 w-5 text-accent" />}
                </button>
              ))}
            </div>
          )}

          {/* Add Child Section */}
          {!showAddChild ? (
            <Button
              onClick={() => setShowAddChild(true)}
              variant="outline"
              className={`w-full rounded-2xl h-12 border-dashed border-2 border-accent text-accent hover:bg-accent/10 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("add_child")}
            </Button>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border-2 border-border">
              <div className="flex justify-center">
                <button
                  onClick={handlePhotoUpload}
                  className="h-16 w-16 rounded-full bg-accent/10 border-2 border-dashed border-accent flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <Upload className="h-6 w-6 text-accent" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Child's name"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent ${isRTL ? "text-right" : ""}`}
              />
              <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  onClick={handleAddChild}
                  className="flex-1 rounded-full bg-accent hover:bg-accent/90"
                  disabled={!newChildName.trim()}
                >
                  Add
                </Button>
                <Button onClick={() => setShowAddChild(false)} variant="outline" className="flex-1 rounded-full">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
