"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type Language = "en" | "he"

type Translations = {
  [key: string]: {
    en: string
    he: string
  }
}

const translations: Translations = {
  // Login / Auth
  "login.title": { en: "SpeechTrack", he: "SpeechTrack" },
  "login.subtitle": { en: "Track your child's speech development", he: "מעקב אחר התפתחות הדיבור של ילדך" },
  "login.username": { en: "Username", he: "שם משתמש" },
  "login.password": { en: "Password", he: "סיסמה" },
  "login.button": { en: "Log In", he: "התחברות" },
  "login.or": { en: "Or continue with", he: "או המשך עם" },
  "login.signup_prompt": { en: "Don't have an account?", he: "אין לך חשבון?" },
  "login.signup_link": { en: "Sign up", he: "הירשם" },
  "signup.title": { en: "Create Account", he: "יצירת חשבון" },
  "signup.confirm_password": { en: "Confirm Password", he: "אימות סיסמה" },

  // Dashboard / Nav
  "nav.home": { en: "Home", he: "בית" },
  "nav.recordings": { en: "Recordings", he: "הקלטות" },
  "nav.family": { en: "Family", he: "משפחה" },
  "nav.alerts": { en: "Alerts", he: "התראות" },
  "nav.settings": { en: "Settings", he: "הגדרות" },

  // Recordings
  "recordings.title": { en: "Recordings", he: "הקלטות" },
  "recordings.empty": { en: "No recordings found", he: "לא נמצאו הקלטות" },
  "recordings.upload": { en: "Upload", he: "העלאה" },
  "recordings.record": { en: "Record", he: "הקלטה" },
  "recordings.track_progress": { en: "Start recording to track", he: "התחל להקליט כדי לעקוב אחר ההתקדמות של" },
  "recordings.your_child": { en: "your child", he: "ילדך" },
  "recordings.delete_confirm": { en: "Are you sure you want to delete this recording?", he: "האם אתה בטוח שברצונך למחוק הקלטה זו?" },
  "recordings.retranscribe_confirm": { en: "Are you sure you want to retranscribe this recording? This will replace the existing transcription.", he: "האם אתה בטוח שברצונך לתמלל מחדש? הפעולה תחליף את התמלול הקיים." },
  "recordings.download_login_error": { en: "You must be logged in to download recordings.", he: "עליך להתחבר כדי להוריד הקלטות." },
  "recordings.retranscribe_login_error": { en: "You must be logged in to retranscribe recordings.", he: "עליך להתחבר כדי לתמלל מחדש הקלטות." },
  "recordings.renamed": { en: "Recording renamed", he: "שם ההקלטה שונה" },
  "recordings.rename_failed": { en: "Failed to rename recording", he: "שינוי שם ההקלטה נכשל" },
  "recordings.download_start": { en: "Download started", he: "הורדה החלה" },
  "recordings.download_failed": { en: "Failed to download recording. It may not exist.", he: "הורדת ההקלטה נכשלה. ייתכן שהקובץ לא קיים." },
  "recordings.error_download": { en: "An error occurred while downloading.", he: "אירעה שגיאה בעת ההורדה." },
  "recordings.retranscribe_started": { en: "Recording is being retranscribed...", he: "ההקלטה נשלחה לתמלול מחדש..." },
  "recordings.error_retranscribe": { en: "An error occurred while retranscribing.", he: "אירעה שגיאה בעת התמלול מחדש." },

  // Family
  "family.parents": { en: "Parents", he: "הורים" },
  "family.children": { en: "Children", he: "ילדים" },
  "family.born": { en: "Born", he: "נולד/ה" },
  "family.add_parent": { en: "Add Parent", he: "הוסף הורה" },
  "family.add_child": { en: "Add Child", he: "הוסף ילד" },
  "family.name": { en: "Name", he: "שם" },
  "family.gender": { en: "Gender", he: "מין" },
  "family.boy": { en: "Boy", he: "בן" },
  "family.girl": { en: "Girl", he: "בת" },
  "family.dob": { en: "Date of Birth", he: "תאריך לידה" },
  "family.voice_sample": { en: "Voice Sample", he: "דגימת קול" },
  "family.recording": { en: "Recording...", he: "מקליט..." },
  "family.recorded": { en: "Recorded", he: "הוקלט" },
  "family.sample_duration": { en: "1-minute sample", he: "דגימה של דקה" },
  "family.create_profile": { en: "Create Profile", he: "צור פרופיל" },
  "family.saving": { en: "Saving...", he: "שומר..." },
  "family.success": { en: "Profile created successfully!", he: "הפרופיל נוצר בהצלחה!" },
  "family.error": { en: "Failed to create profile.", he: "יצירת הפרופיל נכשלה." },
  "family.upload_audio": { en: "Upload Audio File", he: "העלה קובץ שמע" },
  "family.audio_selected": { en: "Audio file selected", he: "קובץ שמע נבחר" },
  "family.mic_denied": { en: "Microphone permission denied", he: "הגישה למיקרופון נדחתה" },

  // Parent Voice Recorder
  "voice.listening": { en: "Listening...", he: "מקליט..." },
  "voice.review": { en: "Review Recording", he: "בדוק הקלטה" },
  "voice.record_title": { en: "Record Your Voice", he: "הקלט את קולך" },
  "voice.instruction_record": { en: "Record a 1-minute sample of your voice speaking naturally.", he: "הקלט דגימה של דקה מהקול שלך בדיבור טבעי." },
  "voice.instruction_review": { en: "Listen to make sure it sounds clear.", he: "האזן כדי לוודא שההקלטה ברורה." },
  "voice.start_recording": { en: "Start Recording", he: "התחל הקלטה" },
  "voice.stop_recording": { en: "Stop Recording", he: "עצור הקלטה" },
  "voice.or": { en: "Or", he: "או" },
  "voice.upload_file": { en: "Upload Audio File", he: "העלה קובץ שמע" },
  "voice.stop": { en: "Stop", he: "עצור" },
  "voice.play": { en: "Play", he: "נגן" },
  "voice.save_profile": { en: "Save Voice Profile", he: "שמור פרופיל קול" },
  "voice.saved": { en: "Voice profile saved!", he: "פרופיל הקול נשמר!" },
  "voice.upload_error": { en: "Failed to upload voice profile", he: "העלאת פרופיל הקול נכשלה" },
  "voice.mic_error": { en: "Could not access microphone", he: "לא ניתן לגשת למיקרופון" },

  // Settings
  "settings.title": { en: "Settings", he: "הגדרות" },
  "settings.account": { en: "Account", he: "חשבון" },
  "settings.account_desc": { en: "Manage your account information", he: "ניהול פרטי החשבון" },
  "settings.sign_out": { en: "Sign Out", he: "התנתק" },
  "settings.language": { en: "Language", he: "שפה" },
  "settings.voice_profile": { en: "Parent Voice Profile", he: "פרופיל קול הורה" },
  "settings.voice_desc": { en: "This helps us identify you as 'Speaker 1' (Mom/Dad) during recordings.", he: "זה עוזר לנו לזהות אותך כ'דובר 1' (אמא/אבא) בשיחות." },
  "settings.my_voice": { en: "My Voice Profile", he: "פרופיל הקול שלי" },
  "settings.missing": { en: "Missing", he: "חסר" },
  "settings.re_record": { en: "Re-record", he: "הקלט מחדש" },
  "settings.record_now": { en: "Record Now", he: "הקלט עכשיו" },
  "settings.appearance": { en: "Appearance", he: "מראה" },
  "settings.appearance_desc": { en: "Customize how the app looks on your device", he: "התאם אישית את מראה האפליקציה" },
  "settings.dark_mode": { en: "Dark Mode", he: "מצב לילה" },
  "settings.light": { en: "Light", he: "בהיר" },
  "settings.dark": { en: "Dark", he: "כהה" },
  "settings.system": { en: "System", he: "מערכת" },
}

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string) => {
    const val = translations[key]?.[language]
    if (!val) {
      // console.warn(`Translation missing for key: ${key}`)
    }
    return val || key
  }

  const dir: "ltr" | "rtl" = language === "he" ? "rtl" : "ltr"

  const value = { language, setLanguage, t, dir }

  return (
    <LanguageContext.Provider value={value}>
      <div dir={dir} className={language === 'he' ? 'font-sans' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
