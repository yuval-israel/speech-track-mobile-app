// Backend API TypeScript Interfaces

export interface User {
  id: string
  email: string
  full_name: string
  profile_image_url?: string
}

export interface Child {
  id: string
  name: string
  birthdate: string // ISO format: YYYY-MM-DD
  gender: string
  profile_image_url?: string
  member_type?: "child" | "parent"
}

export interface POSDistribution {
  [key: string]: number
}

export interface Analysis {
  id?: string
  child_id?: string
  recording_id?: string
  total_tokens: number
  unique_tokens: number
  mlu: number // Mean Length of Utterance
  fluency_score: number // 0-100
  pos_distribution: POSDistribution
  vocabulary_diversity: number
  created_at?: string
}

export interface Recording {
  id: string
  child_id: string
  file_url: string
  duration: number // seconds
  status: "processing" | "completed" | "failed"
  created_at: string
}

export interface ScheduledRoutine {
  id: string
  name: string
  time: string // HH:MM format
  days: number[] // 0-6 (Sunday-Saturday)
  enabled: boolean
}

export interface DashboardData {
  user: User
  children: Child[]
  currentChild: Child
  latestAnalysis: Analysis | null
  weeklyProgress: Array<{ date: string; mlu: number; tokens: number }>
  missedRecordings: Array<{ routine: string; scheduled_time: string }>
  routines: ScheduledRoutine[]
}

export interface RecordingUploadPayload {
  file: File
  child_id: string
  duration: number
}

export interface Reminder {
  id: string
  label: string
  time: string // HH:mm
  days: number[] // 0=Sunday, 1=Monday, etc.
  isEnabled: boolean
}
