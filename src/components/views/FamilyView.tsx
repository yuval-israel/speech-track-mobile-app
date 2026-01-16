"use client"

import { useState, useRef } from "react"
import type { Child } from "../../types/api"
import { Check, Plus, Mic, Save, Loader2, StopCircle, RefreshCw, Square, Upload } from "lucide-react"
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
  // Mock parent data (since we don't have a list of parents from props yet)
  const parents = [
    { id: "parent-1", name: "You", isCurrentUser: true }
  ]

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
                </Avatar >
                <div className="flex-1">
                  <p className="font-medium">{parent.name}</p>
                  {parent.isCurrentUser && <p className="text-sm text-muted-foreground">Admin</p>}
                </div>
              </CardContent >
            </Card >
          ))}

          {/* Add Parent Card - Disabled for now */}
          {/* <AddMemberCard type="parent" onRefresh={onRefresh} /> */}
        </div >
      </section >

      {/* Children Section */}
      < section >
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function AddMemberCard({ type, onRefresh }: AddMemberCardProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [tempAudioFile, setTempAudioFile] = useState<File | null>(null)
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle')
  const [isSaving, setIsSaving] = useState(false)

  // New fields
  const [gender, setGender] = useState<string>("male")
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("audio/")) {
        setTempAudioFile(file)
        setRecordingState('recorded')
        toast.success("Audio file selected")
      } else {
        toast.error("Please upload an audio file")
      }
    }
  }

  const triggerFileInput = () => {
    // Use setTimeout to decouple the click from the current event loop
    // preventing potential focus loss issues with the Dialog
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
  }

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
    if (type === 'child' && (!birthdate || !gender)) return

    setIsSaving(true)
    try {
      // Step 1: Create Profile (JSON)
      const finalName = type === "parent" ? `${name} (Parent)` : name

      const payload: any = {
        name: finalName,
      }

      if (type === 'child') {
        payload.birthdate = birthdate ? format(birthdate, "yyyy-MM-dd") : new Date().toISOString().split('T')[0]
        payload.gender = gender
      } else {
        // Default for parent if needed, though backend model might require it. 
        // Assuming parent doesn't strictly need it or we default it.
        // But the existing code defaulted to "male" and today's date for everyone.
        // Let's keep a safe default if not adding fields for parent.
        payload.birthdate = new Date().toISOString().split('T')[0]
        payload.gender = "male"
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
      // Voice Stamps require a speaker_name. For a child, it's the child's name.
      formData.append("speaker_name", finalName)
      // We must also associate it with the child_id
      formData.append("child_id", childId.toString())

      try {
        await apiFetch(`/voice-stamps/`, {
          method: 'POST',
          body: formData
        })
        toast.success("Profile created successfully!")
      } catch (uploadError) {
        console.error("Audio upload failed", uploadError)
        toast.warning("Profile created, but voice stamp upload failed.")
      }

      // Step 3: Cleanup & Refresh
      setOpen(false)
      setName("")
      setTempAudioFile(null)
      setRecordingState('idle')
      setBirthdate(undefined)
      setGender("male")
      await onRefresh()

    } catch (error) {
      console.error("Failed to create member", error)
      toast.error("Failed to create profile. Please check your connection.")
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setName("")
    setTempAudioFile(null)
    setRecordingState('idle')
    setBirthdate(undefined)
    setGender("male")
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      setOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        <Card className="border-dashed border-muted-foreground/30 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors flex items-center justify-center p-6 h-full min-h-[100px]">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="bg-background p-2 rounded-full border border-dashed">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{type === "parent" ? "Add Parent" : "Add Child"}</span>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{type === "parent" ? "Add Parent" : "Add Child"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {type === 'child' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Select value={gender} onValueChange={setGender} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Boy</SelectItem>
                    <SelectItem value="female">Girl</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !birthdate && "text-muted-foreground"
                      )}
                      disabled={isSaving}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthdate ? format(birthdate, "PPP") : <span>Date of Birth</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={birthdate}
                      onSelect={setBirthdate}
                      initialFocus
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <div className="flex items-center justify-between border rounded-md p-3 bg-muted/20">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Voice Sample</span>
              <span className="text-xs text-muted-foreground">
                {recordingState === 'recording' ? "Recording..." :
                  recordingState === 'recorded' ? "Recorded" : "5-second sample"}
              </span>
            </div>

            <Button
              type="button"
              size="icon"
              variant={recordingState === 'recorded' ? "outline" : recordingState === 'recording' ? "destructive" : "secondary"}
              className={recordingState === 'recorded' ? "text-green-600 border-green-200 bg-green-50" : ""}
              onClick={(e) => {
                e.preventDefault()
                recordingState === 'recording' ? handleStopRecording() : handleStartRecording()
              }}
              disabled={isSaving}
            >
              {recordingState === 'recording' ? <Square className="h-4 w-4 animate-pulse fill-current" /> :
                recordingState === 'recorded' ? <Check className="h-4 w-4" /> :
                  <Mic className="h-4 w-4" />}
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="ml-2"
              onClick={(e) => {
                e.preventDefault()
                triggerFileInput()
              }}
              disabled={isSaving || recordingState === 'recording'}
            >
              <Upload className="h-4 w-4" />
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="audio/*"
              onChange={handleFileUpload}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving || !name || !tempAudioFile || (type === 'child' && (!birthdate || !gender))}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
