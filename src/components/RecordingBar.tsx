"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Upload, Pause, Square, Play, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RecordingBarProps {
    onUpload: (file: File, duration: number) => Promise<void>
}

type RecordingState = "idle" | "recording" | "paused" | "completed"

export function RecordingBar({ onUpload }: RecordingBarProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [recordingState, setRecordingState] = useState<RecordingState>("idle")
    const [recordingTime, setRecordingTime] = useState(0)
    const [recordedFile, setRecordedFile] = useState<File | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const cleanupRecording = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    // Auto-collapse if closed while idle
    const toggleExpand = () => {
        if (isExpanded && recordingState === "idle" && !recordedFile) {
            setIsExpanded(false)
        } else {
            setIsExpanded(true)
        }
    }

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1)
        }, 1000)
    }

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" })
                const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
                setRecordedFile(file)
                chunksRef.current = []

                // Auto-submit or show confirmation? 
                // Based on "Press stop to save", we should probably submit or offer verify.
                // For this UI, let's assume stop -> ready to submit/upload logic or direct upload.
                // User request didn't specify post-stop UI, "Press stop to save details" suggests stop triggers save process.
                // Let's trigger upload immediately for streamlined flow or keep it simple.
                handleUploadProcess(file, recordingTime)
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start()
            setRecordingState("recording")
            setRecordingTime(0)
            startTimer()
        } catch (error) {
            console.error("Failed to start recording:", error)
            alert("Failed to access microphone. Please check permissions.")
        }
    }

    const handlePauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.pause()
            setRecordingState("paused")
            stopTimer()
        }
    }

    const handleResumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
            mediaRecorderRef.current.resume()
            setRecordingState("recording")
            startTimer()
        }
    }

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
            setRecordingState("completed") // Will trigger onstop -> handleUploadProcess
            stopTimer()
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUploadProcess(file, 0)
        }
    }

    const handleUploadProcess = async (file: File, duration: number) => {
        try {
            await onUpload(file, duration)
            // Reset after success
            setRecordingState("idle")
            setRecordingTime(0)
            setRecordedFile(null)
            setIsExpanded(false)
            alert("Recording saved successfully")
        } catch (error) {
            console.error("Failed to upload:", error)
            alert("Failed to save recording")
        }
    }

    // Waveform visualization (simulated CSS)
    const Waveform = () => (
        <div className="flex items-center gap-1 h-8 px-2">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 rounded-full bg-slate-400 transition-all duration-300",
                        recordingState === "recording" ? "animate-pulse h-6" : "h-3"
                    )}
                    style={{ animationDelay: `${i * 0.1}s` }}
                />
            ))}
            <span className="text-xs font-mono text-slate-500 ml-1">
                {recordingState === "idle" ? "00:00" :
                    `${Math.floor(recordingTime / 60).toString().padStart(2, '0')}:${(recordingTime % 60).toString().padStart(2, '0')}`}
            </span>
        </div>
    )

    return (
        <div className="fixed bottom-24 right-4 flex items-center justify-end z-50">
            {/* Expandable Container */}
            <div
                className={cn(
                    "flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-full overflow-hidden transition-all duration-500 ease-in-out pr-2",
                    isExpanded ? "w-auto opacity-100 translate-x-0 pl-4 py-2" : "w-0 opacity-0 translate-x-12 p-0 border-0"
                )}
            >
                <Waveform />

                {/* Upload Button */}
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
                    onClick={handleUploadClick}
                    disabled={recordingState !== "idle"}
                >
                    <Upload className="h-5 w-5" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="audio/*"
                        onChange={handleFileChange}
                    />
                </Button>

                {/* Action Button (Record/Pause/Stop) */}
                {recordingState === "idle" && (
                    <Button
                        variant="default"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white shrink-0 shadow-sm"
                        onClick={handleStartRecording}
                    >
                        <div className="h-3 w-3 rounded-full bg-white" /> {/* Record Dot */}
                    </Button>
                )}

                {recordingState === "recording" && (
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-900 text-white shrink-0"
                            onClick={handlePauseRecording}
                        >
                            <Pause className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-10 w-10 rounded-full shrink-0"
                            onClick={handleStopRecording}
                        >
                            <Square className="h-4 w-4 fill-current" />
                        </Button>
                    </div>
                )}

                {recordingState === "paused" && (
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-900 text-white shrink-0"
                            onClick={handleResumeRecording}
                        >
                            <Play className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-10 w-10 rounded-full shrink-0"
                            onClick={handleStopRecording}
                        >
                            <Square className="h-4 w-4 fill-current" />
                        </Button>
                    </div>
                )}

                {/* Separator / Arrow */}
                <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            </div>

            {/* Main Toggle Button (Always Visible) */}
            <Button
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 z-50 ml-2",
                    isExpanded ? "bg-slate-800 hover:bg-slate-700" : "bg-accent hover:bg-accent/90"
                )}
                onClick={toggleExpand}
            >
                <Mic className={cn("h-6 w-6 text-white transition-transform", isExpanded ? "scale-90" : "scale-100")} />
            </Button>
        </div>
    )
}
