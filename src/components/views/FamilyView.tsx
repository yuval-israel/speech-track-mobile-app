"use client"

import { useState, useRef } from "react"
import type { Child } from "../../types/api"
import { Check, Mic, Save, Loader2, Square } from "lucide-react"
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
  // Separate children based on member_type
  const parentsList = children.filter(c => c.member_type === 'parent')
  const childrenList = children.filter(c => c.member_type !== 'parent')

  // Mock parent data for the current user (Admin/You)
  const currentUser = { id: "current-user", name: "You", isCurrentUser: true }

  return (
    <div className="min-h-screen pb-24 p-6 space-y-8">

      {/* Parents Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Parents</h2>
        <div className="space-y-3">
          {/* Current User Card */}
          <Card key={currentUser.id} className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar >
              <div className="flex-1">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
            </CardContent >
          </Card >

          {/* Other Parents */}
          {parentsList.map((parent) => (
            <Card key={parent.id} className="border-border opacity-70">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${parent.name}`} />
                  <AvatarFallback>{parent.name[0]}</AvatarFallback>
                </Avatar >
                <div className="flex-1">
                  <p className="font-medium">{parent.name}</p>
                  <p className="text-sm text-muted-foreground">Parent</p>
                </div>
              </CardContent >
            </Card >
          ))}

          {/* Add Parent Card */}
          <AddMemberCard type="parent" onRefresh={onRefresh} />
        </div >
      </section >

      {/* Children Section */}
      < section >
        <h2 className="text-xl font-bold mb-4">Children</h2>
        <div className="space-y-3">
          {childrenList.map((child) => {
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

          {/* Add Child Card */}
          <AddMemberCard type="child" onRefresh={onRefresh} />
        </div>
      </section >
    </div >
  )
}

// Sub-component for adding members
interface AddMemberCardProps {
  type: "parent" | "child"
  onRefresh: () => Promise<void>
}

function AddMemberCard({ type, onRefresh }: AddMemberCardProps) {
  const [name, setName] = useState("")
  const [tempAudioFile, setTempAudioFile] = useState<File | null>(null)
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle')
  const [isSaving, setIsSaving] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleStartRecording = async () => {
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
        const file = new File([blob], "voice_sample.webm", { type: mimeType });
        setTempAudioFile(file)
        setRecordingState('recorded')
        toast.success("Voice sample recorded!")

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecordingState('recording')

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop()
        }
      }, 5000)

    } catch (err) {
      console.error("Microphone permission denied", err)
      toast.error("Microphone permission denied")
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }

  const handleSave = async () => {
    if (!name || !tempAudioFile) return

    setIsSaving(true)
    try {
      // Step 1: Create Profile (JSON)
      // Send member_type in payload
      const payload = {
        name: name,
        birthdate: new Date().toISOString().split('T')[0],
        gender: "male",
        member_type: type
      }

      const childResponse = await apiFetch<Child>('/children/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const childId = childResponse.id

      // Step 2: Upload Audio (FormData)
      const formData = new FormData()
      formData.append("file", tempAudioFile)

      try {
        await apiFetch(`/recordings/?child_id=${childId}`, {
          method: 'POST',
          body: formData
        })
        toast.success(`${type === 'parent' ? 'Parent' : 'Child'} profile created successfully!`)
      } catch (uploadError) {
        console.error("Audio upload failed", uploadError)
        toast.warning("Profile created, but audio upload failed.")
      }

      // Step 3: Cleanup & Refresh
      setName("")
      setTempAudioFile(null)
      setRecordingState('idle')
      await onRefresh()

    } catch (error) {
      console.error("Failed to create member", error)
      toast.error("Failed to create profile. Please check your connection.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {type === "parent" ? "Add Parent" : "Add Child"}
          </h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background"
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground italic">
            {recordingState === 'recording' ? "Recording..." :
              recordingState === 'recorded' ? "Voice sample recorded" :
                "Record a 5-second voice sample"}
          </p>
          <div className="flex gap-2">
            {/* Recording Button */}
            <Button
              size="icon"
              variant={recordingState === 'recorded' ? "default" : recordingState === 'recording' ? "destructive" : "outline"}
              className={recordingState === 'recorded' ? "bg-green-500 hover:bg-green-600 text-white" : ""}
              onClick={() => recordingState === 'recording' ? handleStopRecording() : handleStartRecording()}
              disabled={isSaving}
            >
              {recordingState === 'recording' ? <Square className="h-4 w-4 animate-pulse fill-current" /> :
                recordingState === 'recorded' ? <Check className="h-4 w-4" /> :
                  <Mic className="h-4 w-4" />}
            </Button>

            {/* Save Button */}
            <Button
              size="icon"
              disabled={!name || !tempAudioFile || isSaving}
              onClick={handleSave}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
