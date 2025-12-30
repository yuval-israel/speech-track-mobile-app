"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FamilySetupStep } from "./steps/family-setup"
import { VoiceCalibrationStep, ValidationState } from "./steps/voice-calibration"
import { ChildCreate, VoiceStamp, Child } from "@/lib/api/types"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface OnboardingWizardProps {
  onComplete: () => void
  onLogout?: () => void
}

export function OnboardingWizard({ onComplete, onLogout }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // State for Family Setup
  const [childData, setChildData] = useState<Partial<ChildCreate>>({
    name: "",
    birthdate: "",
    gender: "male", // default
  })

  // We might store created child ID if needed for calibration
  const [childId, setChildId] = useState<string | null>(null)

  // Voice Calibration State
  const [parentVoiceDone, setParentVoiceDone] = useState(false)
  const [voiceValidationState, setVoiceValidationState] = useState<ValidationState>({ isValid: false, missing: ["parent_record", "child_record"] })

  const steps = [
    { title: "Family Setup" },
    { title: "Voice Calibration" },
  ]

  // Check for existing parent voice on mount
  useEffect(() => {
    checkExistingParentVoice()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkExistingParentVoice = async () => {
    try {
      console.log("Checking for existing parent voice stamps...")
      // 1. Fetch all children
      const children = await apiFetch<Child[]>('/children/')
      console.log("Children found:", children)

      if (!children || children.length === 0) {
        console.log("No children found to check.")
        return
      }

      // 2. For each child, check voice stamps.
      let foundParent = false;
      for (const child of children) {
        try {
          const stamps = await apiFetch<VoiceStamp[]>(`/voice-stamps/${child.id}`)
          console.log(`Stamps for child ${child.id}:`, stamps)

          // Check for "Parent" case-insensitive
          if (stamps && stamps.some(s => s.speaker_name && s.speaker_name.toLowerCase() === "parent")) {
            foundParent = true;
            break;
          }
        } catch (e) {
          console.error(`Failed to fetch stamps for child ${child.id}`, e)
        }
      }

      if (foundParent) {
        console.log("Found existing parent voice stamp!")
        setParentVoiceDone(true)
        toast.success("Existing parent voice sample found", {
          description: "We'll use the sample from your other child.",
          duration: 4000
        })
      } else {
        console.log("No existing parent voice stamp found.")
      }
    } catch (error) {
      console.error("Failed to check existing voice stamps", error)
    }
  }

  const handleNext = async () => {
    if (step === 0) {
      // Validate Family Setup
      if (!childData.name || !childData.birthdate || !childData.gender) {
        toast.error("Please fill in all fields")
        return
      }

      setIsLoading(true)
      try {
        const createdChild = await apiFetch<{ id: number }>('/children/', {
          method: 'POST',
          body: JSON.stringify(childData)
        })
        const newChildId = createdChild.id.toString()
        setChildId(newChildId)
        toast.success("Child profile created!")

        // Re-check for parent voice reuse (just in case)
        await checkExistingParentVoice()

        setStep(step + 1)
      } catch (error) {
        console.error("Failed to create child:", error)
        toast.error("Failed to create child profile. Please try again.")
      } finally {
        setIsLoading(false)
      }
    } else if (step === 1) {
      // Validate Voice Calibration
      if (!voiceValidationState.isValid) {
        const { missing } = voiceValidationState;

        if (missing.includes("parent_save") || missing.includes("child_save")) {
          toast.error("Unsaved Recordings", {
            description: "Please click the Save button (floppy disk icon) for your recordings before continuing."
          })
        } else if (missing.includes("parent_record")) {
          toast.error("Missing Parent Voice", {
            description: "Please record the parent voice sample."
          })
        } else if (missing.includes("child_record")) {
          toast.error("Missing Child Voice", {
            description: "Please record the child voice sample."
          })
        }
        return
      }
      onComplete()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        {onLogout && (
          <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={onLogout}>
            Logout
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">{steps[step].title}</h1>
          <p className="text-muted-foreground text-center mb-8">
            Step {step + 1} of {steps.length}
          </p>

          <div className="min-h-64">
            {step === 0 && (
              <FamilySetupStep
                data={childData}
                onChange={setChildData}
              />
            )}
            {step === 1 && (
              <VoiceCalibrationStep
                childId={childId!}
                initialParentDone={parentVoiceDone}
                onValidityChange={setVoiceValidationState}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-12">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0 || isLoading}
              className="rounded-xl h-11 flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="rounded-xl h-11 flex-1"
            >
              {isLoading ? "Saving..." : step === steps.length - 1 ? "Complete" : "Next"}
              {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
