"use client"

import { useState, useRef } from "react"
import { Mic, Square, Play, RefreshCw, Upload, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ParentVoiceRecorderProps {
    onComplete: () => void
}

export function ParentVoiceRecorder({ onComplete }: ParentVoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)

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
                const url = URL.createObjectURL(blob)
                setAudioUrl(url)

                // Cleanup tracks
                stream.getTracks().forEach(track => track.stop())
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

    const handlePlayPause = () => {
        if (!audioRef.current || !audioUrl) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    const handleEnded = () => {
        setIsPlaying(false)
    }

    const handleReset = () => {
        setAudioBlob(null)
        setAudioUrl(null)
        setIsPlaying(false)
    }

    const handleUpload = async () => {
        if (!audioBlob) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", audioBlob, "parent_voice.wav")
            formData.append("speaker_name", "Parent")

            await apiFetch("/voice-stamps/", {
                method: "POST",
                body: formData,
            })

            toast.success("Voice profile saved!")
            onComplete()
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload voice profile")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Mic className={cn("w-8 h-8 text-slate-400 dark:text-slate-500 transition-colors", isRecording && "text-red-500 animate-pulse")} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {isRecording ? "Listening..." : audioBlob ? "Review Recording" : "Record Your Voice"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    {isRecording
                        ? "Read a simple sentence naturally."
                        : audioBlob
                            ? "Listen to make sure it sounds clear."
                            : "Read: \"The sun rises in the east, casting golden rays across the morning sky.\""
                    }
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {!audioBlob ? (
                    <Button
                        size="lg"
                        variant={isRecording ? "destructive" : "default"}
                        className="w-full h-12 rounded-full font-medium"
                        onClick={isRecording ? stopRecording : startRecording}
                    >
                        {isRecording ? (
                            <>
                                <Square className="w-4 h-4 mr-2" /> Stop Recording
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4 mr-2" /> Start Recording
                            </>
                        )}
                    </Button>
                ) : (
                    <>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-full border-slate-200 dark:border-slate-800"
                                onClick={handlePlayPause}
                            >
                                {isPlaying ? (
                                    <>
                                        <Square className="w-4 h-4 mr-2" /> Stop
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" /> Play
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 w-12 rounded-full border-slate-200 dark:border-slate-800 p-0 flex-shrink-0"
                                onClick={handleReset}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-12 rounded-full font-medium bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Save Voice Profile
                                </>
                            )}
                        </Button>
                    </>
                )}
            </div>

            {/* Hidden Audio Element for Playback */}
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={handleEnded}
                    className="hidden"
                />
            )}
        </div>
    )
}
