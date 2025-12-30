import { useState } from "react"
import { Play, Download, Trash2, FileAudio, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRecordings } from "@/src/hooks/useRecordings"
import type { Child } from "@/lib/api/types"
import { apiBaseUrl } from "@/lib/api/client"

interface RecordingsViewProps {
    currentChild: Child
}

export function RecordingsView({ currentChild }: RecordingsViewProps) {
    const { recordings, isLoading, error, deleteRecording } = useRecordings(
        currentChild ? parseInt(currentChild.id) : undefined
    )
    const [playingId, setPlayingId] = useState<number | null>(null)

    const handlePlay = (id: number) => {
        setPlayingId(playingId === id ? null : id)
    }

    const handleDownload = (id: number, filename: string) => {
        // Construct download URL using the backend endpoint
        // GET /recordings/by-id/{recording_id}/file
        // Using window.open or creating a link element
        const token = localStorage.getItem("token")
        if (!token) return

        // We can't easily add headers to a direct link download without using fetch/blob workflow.
        // However, if the endpoint requires auth, we need to fetch it as blob.

        // For simplicity, let's try the fetch blob approach:
        fetch(`${apiBaseUrl}/recordings/by-id/${id}/file`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => console.error("Download failed", err));
    }

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this recording?")) {
            await deleteRecording(id)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                <p>{error}</p>
            </div>
        )
    }

    if (recordings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <FileAudio className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No recordings yet</h3>
                <p className="text-sm text-slate-500">
                    Start recording to track {currentChild.name}'s speech progress.
                </p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-8rem)] px-4 py-6">
            <div className="space-y-4 pb-24">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Recordings</h2>

                {recordings.map((recording) => (
                    <Card key={recording.id} className="overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                                        <FileAudio className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 break-all line-clamp-1">
                                            {recording.filename}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{format(new Date(recording.created_at), "MMM d, yyyy")}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {/* Assuming backend might not give duration yet, but if it did */}
                                                {/* For now just showing time */}
                                                <span>{format(new Date(recording.created_at), "h:mm a")}</span>
                                            </div>
                                            <div className="capitalize px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                {recording.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* Audio Player control could go here if we had a direct URL */}
                                    {/* For now, play button is a placeholder or could toggle an audio element if URL known */}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-primary"
                                        onClick={() => handleDownload(recording.id, recording.filename)}
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-destructive"
                                        onClick={() => handleDelete(recording.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Add Audio Player if needed, requiring fetch blob logic similar to download or simplified src if public */}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    )
}
