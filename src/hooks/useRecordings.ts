import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';
import { RecordingOut } from '@/lib/api/types';

interface UseRecordingsResult {
    recordings: RecordingOut[];
    isLoading: boolean;
    error: string | null;
    refreshRecordings: () => Promise<void>;
    deleteRecording: (id: number) => Promise<void>;
}

export function useRecordings(childId: number | undefined): UseRecordingsResult {
    const [recordings, setRecordings] = useState<RecordingOut[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecordings = useCallback(async () => {
        if (!childId) {
            setRecordings([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // The endpoint is /recordings/{child_id} 
            // Based on OpenAPI spec: GET /recordings/{child_id}
            const data = await apiFetch<RecordingOut[]>(`/recordings/${childId}`);
            setRecordings(data);
        } catch (err) {
            console.error('Failed to fetch recordings:', err);
            setError('Failed to load recordings');
        } finally {
            setIsLoading(false);
        }
    }, [childId]);

    const deleteRecording = useCallback(async (id: number) => {
        try {
            await apiFetch<void>(`/recordings/${id}`, { method: 'DELETE' });
            // Updates functionality to remove deleted recording from local state
            setRecordings((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error('Failed to delete recording:', err);
            throw err;
        }
    }, []);

    // Initial fetch on mount or when childId changes
    useEffect(() => {
        fetchRecordings();
    }, [fetchRecordings]);

    // Smart polling - only poll when there are recordings being processed
    useEffect(() => {
        // Check if any recordings are in a processing state
        const hasProcessingRecordings = recordings.some(r =>
            r.status === 'pending' ||
            r.status === 'queued' ||
            r.status === 'transcribing' ||
            r.status === 'analyzing'
        );

        if (!hasProcessingRecordings) {
            // No processing recordings, no need to poll
            return;
        }

        // Poll every 3 seconds while recordings are processing
        const interval = setInterval(() => {
            fetchRecordings();
        }, 3000);

        return () => clearInterval(interval);
    }, [recordings, fetchRecordings]);

    return {
        recordings,
        isLoading,
        error,
        refreshRecordings: fetchRecordings,
        deleteRecording,
    };
}
