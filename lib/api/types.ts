export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  username: string;
  created_at: string;
  has_voice_profile: boolean;
}

export interface Gender {
  enum: "male" | "female";
}
// ... (skipping unchanged parts)

export interface ChildOut {
  id: number;
  name: string;
  birthdate: string;
  gender: "male" | "female";
  created_at: string;
}

export interface VoiceStamp {
  id: string;
  child_id: string;
  filename: string;
  speaker_name: "Parent" | "Child" | string;
  created_at: string;
}

export interface ChildCreate {
  name: string;
  birthdate: string;
  gender: "male" | "female";
}

export interface TranscriptionOut {
  id: number;
  recording_id: number;
  path: string;
  json_path?: string | null;
  confidence?: number | null;
}

export interface RecordingOut {
  id: number;
  filename: string;
  created_at: string;
  child_id: number;
  child: ChildOut;
  status: "queued" | "transcribing" | "analyzing" | "ready" | "failed";
  transcriptions: TranscriptionOut[];
}

export interface LexicalCounts {
  utterances: number;
  tokens_surface: number;
  types_surface: number;
  types_lemma: number;
  hapax_surface: number;
  hapax_lemma: number;
}

export interface InitialLexicalDiversity { // Part of LexicalDiversity
  ttr_surface: number;
  ttr_lemma: number;
  // Add other fields if needed
}

export interface MLUMetrics {
  mlu_morphemes: number;
  mlu_words: number;
}

export interface SpeechMetrics {
  total_speech_duration_seconds: number;
  overall_wpm_including_pauses: number;
  articulation_wpm_excluding_between_pauses: number;
  words_per_second_articulation: number;
}

export interface RecordingAnalysisOut {
  schema_version: string;
  session_id: string;
  counts: LexicalCounts;
  lexical_diversity: any; // Simplified for now
  mlu: MLUMetrics;
  speech: SpeechMetrics;
  syntax: any;
  pos_distribution: Record<string, number>;
  morph_distributions: any;
  vocabulary: any;
  child_name?: string | null;
}

export interface ChildAggregates {
  total_sessions: number;
  total_speech_duration_seconds: number;
  total_tokens_surface: number;
  total_types_surface: number;
  total_types_lemma: number;
  total_utterances: number;
  pos_distribution: Record<string, number>;
  global_mlu_words: number;
}

export interface ChildGlobalAnalysisOut {
  schema_version: string;
  child_name?: string | null;
  aggregates: ChildAggregates;
}

// Frontend specific types
export interface POSDistribution {
  [key: string]: number; // Percentage
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile_image_url?: string;
  has_voice_profile: boolean;
}

export interface Child {
  id: string;
  name: string;
  birthdate: string;
  gender: string;
  profile_image_url?: string;
}

export interface Analysis {
  id?: string;
  child_id?: string;
  recording_id?: string;
  total_tokens: number;
  unique_tokens: number;
  mlu: number;
  fluency_score: number;
  pos_distribution: POSDistribution;
  vocabulary_diversity: number; // For DataView but maybe optional?
  created_at?: string;
}

// Adapters
export function adaptUser(userOut: UserOut): User {
  return {
    id: userOut.id.toString(),
    email: userOut.username, // Fallback
    full_name: userOut.username,
    profile_image_url: undefined,
    has_voice_profile: userOut.has_voice_profile
  };
}

export function adaptChild(childOut: ChildOut): Child {
  return {
    id: childOut.id.toString(),
    name: childOut.name,
    birthdate: childOut.birthdate,
    gender: childOut.gender,
    profile_image_url: undefined
  };
}

export function adaptAnalysis(data: RecordingAnalysisOut | ChildGlobalAnalysisOut): Analysis {
  let total_tokens = 0;
  let unique_tokens = 0;
  let pos_counts: Record<string, number> = {};
  let mlu = 0;
  let vocabulary_diversity = 0; // Simplified

  if ('counts' in data) {
    // RecordingAnalysisOut
    total_tokens = data.counts.tokens_surface;
    unique_tokens = data.counts.types_surface;
    pos_counts = data.pos_distribution;
    mlu = data.mlu.mlu_words;
    // vocabulary_diversity = data.lexical_diversity... // TODO depending on metrics
  } else {
    // ChildGlobalAnalysisOut
    total_tokens = data.aggregates.total_tokens_surface;
    unique_tokens = data.aggregates.total_types_surface;
    pos_counts = data.aggregates.pos_distribution;
    mlu = data.aggregates.global_mlu_words;
  }

  // Calculate percentages for POS
  const total_pos = Object.values(pos_counts).reduce((a, b) => a + b, 0);
  const pos_distribution: POSDistribution = {};

  if (total_pos > 0) {
    for (const [key, value] of Object.entries(pos_counts)) {
      pos_distribution[key] = parseFloat(((value / total_pos) * 100).toFixed(1));
    }
  }

  return {
    total_tokens,
    unique_tokens,
    pos_distribution,
    mlu,
    fluency_score: 0, // Mock
    vocabulary_diversity: 0, // Mock
    // id, child_id etc are missing from AnalysisOut, added as optional in interface
  };
}
// ... (existing code)
export interface ChildShareOut {
  user_id: number;
  username: string;
  role: "owner" | "editor" | "spectator";
  status: "invited" | "accepted" | "revoked";
  invited_by_id: number | null;
}
