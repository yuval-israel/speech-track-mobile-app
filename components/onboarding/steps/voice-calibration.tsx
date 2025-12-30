"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Play, Save, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

export type ValidationState = {
  isValid: boolean
  missing: ("parent_record" | "child_record" | "parent_save" | "child_save")[]
}

interface VoiceCalibrationStepProps {
  childId?: string
  initialParentDone?: boolean
  onValidityChange: (state: ValidationState) => void
}

export function VoiceCalibrationStep({ childId, initialParentDone = false, onValidityChange }: VoiceCalibrationStepProps) {
  // Parent state
  const [parentRecording, setParentRecording] = useState<Blob | null>(null)
  const [isParentRecording, setIsParentRecording] = useState(false)
  const [parentAudioUrl, setParentAudioUrl] = useState<string | null>(null)
  const [parentSaved, setParentSaved] = useState(initialParentDone)
  const [parentUploading, setParentUploading] = useState(false)

  // Child state
  const [childRecording, setChildRecording] = useState<Blob | null>(null)
  const [isChildRecording, setIsChildRecording] = useState(false)
  const [childAudioUrl, setChildAudioUrl] = useState<string | null>(null)
  const [childSaved, setChildSaved] = useState(false)
  const [childUploading, setChildUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Notify parent component about validity
  useEffect(() => {
    const missing: ValidationState["missing"] = []

    if (!parentSaved) {
      if (!parentRecording) missing.push("parent_record")
      else missing.push("parent_save")
    }

    if (!childSaved) {
      if (!childRecording) missing.push("child_record")
      else missing.push("child_save")
    }

    onValidityChange({
      isValid: missing.length === 0,
      missing
    })
  }, [parentSaved, childSaved, parentRecording, childRecording, onValidityChange])

  // Sync initialParentDone prop
  useEffect(() => {
    if (initialParentDone) {
      setParentSaved(true)
    }
  }, [initialParentDone])

  const startRecording = async (type: "parent" | "child") => {
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(blob)
        if (type === "parent") {
          setParentRecording(blob)
          setParentAudioUrl(url)
          setParentSaved(false)
        } else {
          setChildRecording(blob)
          setChildAudioUrl(url)
          setChildSaved(false)
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      if (type === "parent") setIsParentRecording(true)
      else setIsChildRecording(true)

    } catch (err) {
      console.error("Failed to start recording:", err)
      toast.error("Microphone access denied or error occurred.")
    }
  }

  const stopRecording = (type: "parent" | "child") => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      if (type === "parent") setIsParentRecording(false)
      else setIsChildRecording(false)
    }
  }

  const playRecording = (type: "parent" | "child") => {
    const url = type === "parent" ? parentAudioUrl : childAudioUrl
    if (url) {
      const audio = new Audio(url)
      audio.play()
    }
  }

  const saveRecording = async (type: "parent" | "child") => {
    if (!childId) {
      toast.error("Child ID missing. Cannot save.")
      return
    }
    const blob = type === "parent" ? parentRecording : childRecording
    if (!blob) return

    // Ensure we send correct role/name
    const speakerName = type === "parent" ? "Parent" : "Child"

    const file = new File([blob], "audio.wav", { type: "audio/wav" })
    const formData = new FormData()
    formData.append("file", file)

    try {
      if (type === "parent") setParentUploading(true)
      else setChildUploading(true)

      await apiFetch(`/voice-stamps/?child_id=${childId}&speaker_name=${speakerName}`, {
        method: "POST",
        body: formData,
      })

      toast.success(`${speakerName} voice sample saved!`)
      if (type === "parent") setParentSaved(true)
      else setChildSaved(true)

    } catch (err) {
      console.error("Failed to upload voice stamp:", err)
      toast.error("Failed to save voice stamp.")
    } finally {
      if (type === "parent") setParentUploading(false)
      else setChildUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Parent Voice Recording */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center justify-between">
          Parent Voice Sample
          {parentSaved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
        </h3>

        {parentSaved ? (
          <Card className="p-4 bg-blue-50/50 border-blue-100 flex justify-between items-center">
            <p className="text-sm text-muted-foreground flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Parent voice calibrated and saved.</p>
            <Button variant="ghost" size="sm" onClick={() => setParentSaved(false)} className="text-xs text-muted-foreground hover:text-foreground">Redo</Button>
          </Card>
        ) : (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center relative">
                <Mic className={`w-10 h-10 text-accent ${isParentRecording ? 'animate-pulse' : ''}`} />
              </div>
              <p className="text-sm text-muted-foreground text-center">Read: "Hello, how are you today?"</p>
              <div className="flex gap-3">
                <Button
                  variant={isParentRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => isParentRecording ? stopRecording("parent") : startRecording("parent")}
                  className="rounded-full w-12 h-12 p-0"
                >
                  {isParentRecording ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Mic className="w-4 h-4" />}
                  <span className="sr-only">Record</span>
                </Button>

                {parentAudioUrl && !isParentRecording && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => playRecording("parent")} className="rounded-full w-12 h-12 p-0 bg-transparent">
                      <Play className="w-4 h-4" />
                      <span className="sr-only">Play</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => saveRecording("parent")}
                      disabled={parentSaved || parentUploading}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      {parentUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      <span className="sr-only">Save</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Child Voice Recording */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center justify-between">
          Child Voice Sample
          {childSaved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
        </h3>
        <Card className={`p-6 bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200 ${childSaved ? 'opacity-75' : ''}`}>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center relative">
              <Mic className={`w-10 h-10 text-accent ${isChildRecording ? 'animate-pulse' : ''}`} />
            </div>
            <p className="text-sm text-muted-foreground text-center">Let your child say a few words or sounds</p>
            <div className="flex gap-3">
              <Button
                variant={isChildRecording ? "destructive" : "outline"}
                size="sm"
                onClick={() => isChildRecording ? stopRecording("child") : startRecording("child")}
                className="rounded-full w-12 h-12 p-0"
              >
                {isChildRecording ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Mic className="w-4 h-4" />}
                <span className="sr-only">Record</span>
              </Button>

              {childAudioUrl && !isChildRecording && (
                <>
                  <Button variant="outline" size="sm" onClick={() => playRecording("child")} className="rounded-full w-12 h-12 p-0 bg-transparent">
                    <Play className="w-4 h-4" />
                    <span className="sr-only">Play</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => saveRecording("child")}
                    disabled={childSaved || childUploading}
                    className="rounded-full w-12 h-12 p-0"
                  >
                    {childUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="sr-only">Save</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-6">
        <p className="text-sm text-teal-900">
          <strong>Tip:</strong> These voice samples help us identify speakers in future recordings.
        </p>
      </div>
    </div>
  )
}
