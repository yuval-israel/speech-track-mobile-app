"use client"

import { useState } from "react"
import { Mic, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function VoiceStampFlow() {
  const [step, setStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [childName, setChildName] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
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
            <Button
              onClick={toggleRecording}
              className={`w-full py-4 rounded-full font-semibold text-base transition-all ${
                isRecording ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Mic className="w-5 h-5 mr-2" />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>

            <Button
              onClick={handleNext}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold py-4"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
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
                      className={`flex-1 rounded-xl ${
                        gender === g ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-300 text-slate-900"
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
                onClick={handleNext}
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
            <Button
              onClick={toggleRecording}
              className={`w-full py-4 rounded-full font-semibold text-base transition-all ${
                isRecording ? "bg-red-600 hover:bg-red-700 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              <Mic className="w-5 h-5 mr-2" />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>

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
                onClick={() => {
                  // Handle completion
                  alert("Voice Stamp setup complete!")
                }}
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
