"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Upload, StopCircle, Pause, Play, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RecordingBarProps {
    onUpload: (file: File, duration: number) => Promise<void>
}

type RecordingState = "idle" | "recording" | "paused" | "uploading"

export function RecordingBar({ onUpload }: RecordingBarProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [recordingState, setRecordingState] = useState<RecordingState>("idle")
    const [recordingTime, setRecordingTime] = useState(0)

    // Recording Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            stopTimer()
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop()
            }
        }
    }, [])

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setRecordingTime(0)
        timerRef.current = setInterval(() => {
            setRecordingTime((prev: number) => prev + 1)
        }, 1000)
    }

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            console.log("Starting recording with mimeType:", mediaRecorder.mimeType)

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm'
                const blob = new Blob(chunksRef.current, { type: mimeType })
                // We name it .webm to allow the backend to detect it easily, though the backend relies on pydub detection.
                // Using a safe fallback name.
                const file = new File([blob], "recording.webm", { type: mimeType })

                // Auto-save logic
                setRecordingState("uploading")
                try {
                    await onUpload(file, recordingTime)
                } finally {
                    setRecordingState("idle")
                    setIsExpanded(false)
                    setRecordingTime(0)
                }

                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setRecordingState("recording")
            startTimer()
            setIsExpanded(false) // Collapse menu to show recording controls only
        } catch (err) {
            console.error("Microphone access denied", err)
        }
    }

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
            stopTimer()
        }
    }

    const handlePauseResume = () => {
        if (!mediaRecorderRef.current) return

        if (recordingState === "recording") {
            mediaRecorderRef.current.pause()
            setRecordingState("paused")
            stopTimer()
        } else if (recordingState === "paused") {
            mediaRecorderRef.current.resume()
            setRecordingState("recording")
            startTimer()
        }
    }

    const handleUploadFile = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "audio/*"
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                setRecordingState("uploading")
                try {
                    await onUpload(file, 0)
                } finally {
                    setRecordingState("idle")
                    setIsExpanded(false)
                }
            }
        }
        input.click()
    }

    // Toggle Main Button (Expand/Collapse)
    const toggleExpand = () => {
        if (recordingState !== "idle") return // Don't collapse if recording
        setIsExpanded(!isExpanded)
    }

    return (
        <div className="fixed bottom-24 right-4 z-40 flex flex-row items-center justify-end gap-3 transition-all duration-300">
            {/* Expanded Options (Upload & Record) - Only visible when IDLE and EXPANDED */}
            {isExpanded && recordingState === "idle" && (
                <div className="flex flex-row items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-200 mr-2">
                    <Button
                        onClick={handleUploadFile}
                        className="h-12 w-12 rounded-full bg-white text-primary shadow-lg hover:bg-gray-100"
                        title="Upload File"
                    >
                        <Upload className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={handleStartRecording}
                        className="h-12 w-12 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                        title="Start Recording"
                    >
                        <Mic className="h-5 w-5" />
                    </Button>
                </div>
            )}

            {/* Main/Control Bar */}
            <div className={cn(
                "flex items-center gap-2 rounded-full shadow-2xl transition-all duration-300 bg-accent text-white p-1",
                recordingState !== "idle" ? "pl-4 pr-1 h-14" : "h-14 w-14 justify-center"
            )}>
                {recordingState === "idle" ? (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-full w-full rounded-full hover:bg-accent/80 p-0"
                        onClick={toggleExpand}
                    >
                        {isExpanded ? <X className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                ) : (
                    // Recording Controls (Inline)
                    <>
                        {recordingState === "uploading" ? (
                            <div className="flex items-center gap-2 px-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">Saving...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mr-2">
                                    <div className={cn("h-2 w-2 rounded-full bg-red-500", recordingState === "recording" && "animate-pulse")} />
                                    <span className="font-mono text-sm font-medium min-w-[3rem]">
                                        {formatTime(recordingTime)}
                                    </span>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 full rounded-full hover:bg-white/20"
                                    onClick={handlePauseResume}
                                >
                                    {recordingState === "recording" ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </Button>

                                <Button
                                    size="icon"
                                    className="h-10 w-10 full rounded-full bg-white text-accent hover:bg-gray-100 ml-1"
                                    onClick={handleStopRecording}
                                >
                                    <StopCircle className="h-5 w-5 fill-current" />
                                </Button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
