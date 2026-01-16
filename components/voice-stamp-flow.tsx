"use client"

import { useState, useRef } from "react"
import { Mic, ChevronRight, Loader2, Upload } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface VoiceStampFlowProps {
  isParent?: boolean
  onComplete?: () => void
}

export function VoiceStampFlow({ isParent, onComplete }: VoiceStampFlowProps) {
  const [step, setStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [speakerName, setSpeakerName] = useState("Parent")
  const [childName, setChildName] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      toast.error("Could not access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("audio/")) {
        setAudioBlob(file)
        toast.success("Audio file selected")
      } else {
        toast.error("Please upload an audio file")
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleNext = async () => {
    if (step === 1) {
      // Logic for Parent Voice Step
      if (!audioBlob) {
        toast.error("Please record your voice first")
        return
      }

      // If isParent is true, we upload immediately linked to the user
      // If NOT isParent, we might just be storing it for later? Or maybe we don't support non-parent flow in step 1 yet?
      // The prompt says "If isParent={true}: Send to POST /voice-stamps/ without a child_id."

      if (isParent) {
        setIsUploading(true)
        try {
          const formData = new FormData()
          formData.append("file", audioBlob, "parent_voice.wav")
          formData.append("speaker_name", speakerName || "Parent")
          // No child_id for parent

          await apiFetch("/voice-stamps/", {
            method: "POST",
            body: formData,
          })

          toast.success("Voice stamp saved!")
          // Prepare for next step or finish?
          // If this is registration, we proceed to child setup
          setStep(step + 1)
          setAudioBlob(null) // Reset for next recording
        } catch (error) {
          console.error(error)
          toast.error("Failed to upload voice stamp")
        } finally {
          setIsUploading(false)
        }
        return
      }
    }

    // Default transition for other cases
    if (step < 3) {
      setStep(step + 1)
      setAudioBlob(null)
    } else {
      // Step 3 Completion
      if (onComplete) onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50 px-4 py-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">Voice Setup</h1>
          <div className="text-sm text-slate-600">Step {step} of 3</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Screen 1: Parent Calibration */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Waveform Animation */}
            <div className="flex justify-center py-12">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
                <div className="absolute inset-2 bg-blue-50 rounded-full flex items-center justify-center">
                  <Mic className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Speaker Name Input */}
            <Card className="bg-white border-0 shadow-sm rounded-2xl p-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">Your Name (for transcription)</label>
              <Input
                type="text"
                placeholder="e.g. Dad, Mom, Yuval"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                className="rounded-xl border-slate-300"
              />
            </Card>

            {/* Instruction Text */}
            <Card className="bg-white border-0 shadow-sm rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Let's learn your voice first</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Please read the text below in your natural speaking voice.
              </p>
            </Card>

            {/* Reading Card */}
            <Card className="bg-blue-50 border-0 shadow-sm rounded-2xl p-6">
              <p className="text-slate-700 leading-relaxed text-sm">
                "The sun rises in the east, casting golden rays across the morning sky. Birds sing their daily songs
                while the world wakes up to another beautiful day. Each moment brings new possibilities and hope for the
                future."
              </p>
            </Card>

            {/* Recording Button */}
            <div className="space-y-3">
              <Button
                onClick={toggleRecording}
                className={`w-full py-4 rounded-full font-semibold text-base transition-all ${isRecording ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                <Mic className="w-5 h-5 mr-2" />
                {isRecording ? "Stop Recording" : (audioBlob ? "Rerecord" : "Start Recording")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-2 text-slate-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={triggerFileInput}
                className="w-full py-4 rounded-full font-semibold text-base border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Audio File
              </Button>
            </div>

            {audioBlob && !isRecording && (
              <div className="text-center text-sm text-green-600 font-medium">
                Audio ready to submit!
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={isUploading || (!audioBlob && !isRecording)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold py-4"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Screen 2: Child Profile Setup */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Avatar Placeholder */}
            <div className="flex justify-center py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                <div className="text-3xl font-semibold text-slate-400">👶</div>
              </div>
            </div>

            {/* Form */}
            <Card className="bg-white border-0 shadow-sm rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Child's Name</label>
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Date of Birth</label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Gender</label>
                <div className="flex gap-3">
                  {["Boy", "Girl", "Other"].map((g) => (
                    <Button
                      key={g}
                      variant={gender === g ? "default" : "outline"}
                      onClick={() => setGender(g)}
                      className={`flex-1 rounded-xl ${gender === g ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-300 text-slate-900"
                        }`}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Expert Helper */}
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center flex-shrink-0 text-lg">
                👩‍⚕️
              </div>
              <Card className="bg-purple-50 border-0 shadow-sm rounded-2xl p-4 flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-purple-900">Expert Tip:</span> This helps us compare results to
                  age-appropriate benchmarks.
                </p>
              </Card>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1 rounded-full border-slate-300 text-slate-900"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 3: Child Calibration */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Animation */}
            <div className="flex justify-center py-12">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-teal-100 rounded-full opacity-30 animate-pulse"></div>
                <div className="absolute inset-2 bg-teal-50 rounded-full flex items-center justify-center">
                  <Mic className="w-10 h-10 text-teal-600" />
                </div>
              </div>
            </div>

            {/* Instruction */}
            <Card className="bg-white border-0 shadow-sm rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Now, let's record {childName || "your child"}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask them to say a simple sentence or sing a song.
              </p>
            </Card>

            {/* Recording Button - Playful Teal */}
            <div className="space-y-3">
              <Button
                onClick={toggleRecording}
                className={`w-full py-4 rounded-full font-semibold text-base transition-all ${isRecording ? "bg-red-600 hover:bg-red-700 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
              >
                <Mic className="w-5 h-5 mr-2" />
                {isRecording ? "Stop Recording" : (audioBlob ? "Rerecord" : "Start Recording")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-2 text-slate-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={triggerFileInput}
                className="w-full py-4 rounded-full font-semibold text-base border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Audio File
              </Button>
            </div>

            {audioBlob && !isRecording && (
              <div className="text-center text-sm text-teal-600 font-medium">
                Audio ready to submit!
              </div>
            )}

            {/* Hidden Input for both steps */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="audio/*"
              onChange={handleFileUpload}
            />

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1 rounded-full border-slate-300 text-slate-900"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={onComplete && !audioBlob} // Basic validation
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-semibold"
              >
                Finish Setup
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
