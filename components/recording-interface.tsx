"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { Mic, Pause, Play, StopCircle, Upload, Share2, X } from "lucide-react"

type RecordingState = "idle" | "recording" | "paused" | "completed"

interface RecordingInterfaceProps {
  open: boolean
  onClose: () => void
}

export function RecordingInterface({ open, onClose }: RecordingInterfaceProps) {
  const { t, isRTL } = useLanguage()
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)

  const handleStartRecording = () => {
    setRecordingState("recording")
    setRecordingTime(0)
    setHasRecording(true)
  }

  const handlePauseRecording = () => {
    setRecordingState("paused")
  }

  const handleResumeRecording = () => {
    setRecordingState("recording")
  }

  const handleStopRecording = () => {
    setRecordingState("completed")
  }

  const handleUploadFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "audio/*"
    input.onchange = () => {
      setHasRecording(true)
      setRecordingState("completed")
    }
    input.click()
  }

  const handleShareRecording = () => {
    console.log("Sharing recording...")
  }

  const handleClose = () => {
    setRecordingState("idle")
    setRecordingTime(0)
    setHasRecording(false)
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`max-w-sm rounded-3xl ${isRTL ? "rtl" : "ltr"}`}>
        <DialogHeader className={isRTL ? "text-right" : ""}>
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <DialogTitle>Recording Session</DialogTitle>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recording Visualization */}
          <div className="flex justify-center">
            <div className="relative h-32 w-32 rounded-full bg-accent/10 border-4 border-accent flex items-center justify-center">
              {recordingState === "recording" && (
                <div className="absolute inset-0 rounded-full animate-pulse bg-accent/20" />
              )}
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{formatTime(recordingTime)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {recordingState === "recording" && "Recording..."}
                  {recordingState === "paused" && "Paused"}
                  {recordingState === "idle" && "Ready"}
                  {recordingState === "completed" && "Saved"}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className={`flex gap-2 justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
            {recordingState === "idle" && (
              <>
                <Button
                  onClick={handleStartRecording}
                  className="flex-1 rounded-full bg-accent hover:bg-accent/90 h-12"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {t("mic_button")}
                </Button>
                <Button
                  onClick={handleUploadFile}
                  variant="outline"
                  className="flex-1 rounded-full h-12 bg-transparent"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {t("upload")}
                </Button>
              </>
            )}

            {recordingState === "recording" && (
              <>
                <Button
                  onClick={handlePauseRecording}
                  variant="outline"
                  className="flex-1 rounded-full h-12 bg-transparent"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  {t("pause")}
                </Button>
                <Button
                  onClick={handleStopRecording}
                  className="flex-1 rounded-full bg-destructive hover:bg-destructive/90 h-12"
                >
                  <StopCircle className="h-5 w-5 mr-2" />
                  {t("stop")}
                </Button>
              </>
            )}

            {recordingState === "paused" && (
              <>
                <Button
                  onClick={handleResumeRecording}
                  className="flex-1 rounded-full bg-accent hover:bg-accent/90 h-12"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {t("resume")}
                </Button>
                <Button
                  onClick={handleStopRecording}
                  className="flex-1 rounded-full bg-destructive hover:bg-destructive/90 h-12"
                >
                  <StopCircle className="h-5 w-5 mr-2" />
                  {t("stop")}
                </Button>
              </>
            )}

            {recordingState === "completed" && hasRecording && (
              <Button onClick={handleShareRecording} className="w-full rounded-full bg-accent hover:bg-accent/90 h-12">
                <Share2 className="h-5 w-5 mr-2" />
                {t("share")}
              </Button>
            )}
          </div>

          {/* Recording Info */}
          {hasRecording && recordingState === "completed" && (
            <Card className="rounded-2xl bg-muted/30 border-muted">
              <CardContent className="pt-4">
                <div className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                  <p className="text-sm font-medium">Recording saved successfully</p>
                  <p className="text-xs text-muted-foreground">Duration: {formatTime(recordingTime)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
