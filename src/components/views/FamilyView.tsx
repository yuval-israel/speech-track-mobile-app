"use client"

import { useState, useRef } from "react"
import type { Child } from "../../types/api"
import { Check, Plus, Mic, Save, Loader2, StopCircle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface FamilyViewProps {
  children: Child[]
  currentChild: Child
  onSwitchChild: (childId: string) => void
  onAddChild: () => void // Kept for interface compatibility
  onRefresh: () => Promise<void>
}

export function FamilyView({ children, currentChild, onSwitchChild, onAddChild, onRefresh }: FamilyViewProps) {
  // State for adding new members
  const [newChildName, setNewChildName] = useState("")
  const [newChildVoice, setNewChildVoice] = useState<File | null>(null)
  const [newParentName, setNewParentName] = useState("")
  const [newParentVoice, setNewParentVoice] = useState<File | null>(null)

  const [isRecording, setIsRecording] = useState<"parent" | "child" | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Mock parent data (since we don't have a list of parents from props yet)
  const parents = [
    { id: "parent-1", name: "You", isCurrentUser: true }
  ]

  const startRecording = async (type: "parent" | "child") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], "recording.webm", { type: mimeType });

        if (type === "parent") {
          setNewParentVoice(file)
        } else {
          setNewChildVoice(file)
        }
        setIsRecording(null)
        toast.success("Voice sample recorded!")

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(type)

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop()
        }
      }, 5000)

    } catch (err) {
      console.error("Microphone access denied", err)
      toast.error("Microphone access denied")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }

  const handleSave = async (type: "parent" | "child") => {
    const name = type === "parent" ? newParentName : newChildName
    const file = type === "parent" ? newParentVoice : newChildVoice

    if (!name || !file) return

    setIsSaving(true)
    const formData = new FormData()
    formData.append("name", name)
    formData.append("birthdate", new Date().toISOString().split('T')[0])
    formData.append("gender", "male")

    // Logic: parents are created as children for now with "(Parent)" suffix
    if (type === "parent") {
      formData.append("name", name + " (Parent)")
      formData.append("file", file)
    } else {
      formData.append("name", name)
      formData.append("file", file)
    }

    try {
      await apiFetch('/children/', {
        method: 'POST',
        body: formData
      })

      toast.success("Profile created successfully")

      // Reset form
      if (type === "parent") {
        setNewParentName("")
        setNewParentVoice(null)
      } else {
        setNewChildName("")
        setNewChildVoice(null)
      }

      // Refresh list
      await onRefresh()

    } catch (e) {
      console.error("Failed to create profile", e)
      toast.error("Failed to create profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen pb-24 p-6 space-y-8">

      {/* Parents Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Parents</h2>
        <div className="space-y-3">
          {parents.map((parent) => (
            <Card key={parent.id} className="border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${parent.name}`} />
                  <AvatarFallback>{parent.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{parent.name}</p>
                  {parent.isCurrentUser && <p className="text-sm text-muted-foreground">Admin</p>}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Inline Add Parent */}
          <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Add Parent</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="bg-background"
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground italic">
                  {isRecording === "parent" ? "Recording..." : newParentVoice ? "Voice sample recorded" : "Record a 5-second voice sample"}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant={newParentVoice ? "default" : isRecording === "parent" ? "destructive" : "outline"}
                    className={newParentVoice ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                    onClick={() => isRecording === "parent" ? stopRecording() : startRecording("parent")}
                    disabled={isSaving}
                  >
                    {isRecording === "parent" ? <StopCircle className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    disabled={!newParentName || !newParentVoice || isSaving}
                    onClick={() => handleSave("parent")}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Children Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Children</h2>
        <div className="space-y-3">
          {children.map((child) => {
            const isActive = child.id === currentChild?.id
            return (
              <Card
                key={child.id}
                className={`transition-colors cursor-pointer ${isActive ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50"}`}
                onClick={() => onSwitchChild(child.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={child.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`} />
                    <AvatarFallback>{child.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{child.name}</p>
                    <p className="text-sm text-muted-foreground">Born: {child.birthdate}</p>
                  </div>
                  {isActive && <Check className="h-5 w-5 text-accent" />}
                </CardContent>
              </Card>
            )
          })}

          {/* Inline Add Child */}
          <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Add Child</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="bg-background"
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground italic">
                  {isRecording === "child" ? "Recording..." : newChildVoice ? "Voice sample recorded" : "Record a 5-second voice sample"}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant={newChildVoice ? "default" : isRecording === "child" ? "destructive" : "outline"}
                    className={newChildVoice ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                    onClick={() => isRecording === "child" ? stopRecording() : startRecording("child")}
                    disabled={isSaving}
                  >
                    {isRecording === "child" ? <StopCircle className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    disabled={!newChildName || !newChildVoice || isSaving}
                    onClick={() => handleSave("child")}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
