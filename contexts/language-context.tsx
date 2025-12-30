"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type Language = "he" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isRTL: boolean
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  he: {
    home: "בית",
    family: "משפחה",
    record: "הקליט",
    data: "נתונים",
    alerts: "התראות",
    vocabulary_count: "ספירת מילים",
    mlu: "אורך ממוצע של משפט",
    interaction_fluency: "רשות השפה",
    add_child: "הוסף ילד",
    edit_profile: "ערוך פרופיל",
    settings: "הגדרות",
    mic_button: "הקליט",
    pause: "השהה",
    resume: "חזור",
    stop: "עצור",
    upload: "העלה",
    share: "שתף",
    language: "שפה",
    hebrew: "עברית",
    english: "אנגלית",
    notify_before: "התראה 5 דקות לפני",
    snooze: "שנת קיפאון",
    birthdate: "תאריך לידה",
    parent_profile: "פרופיל הורה",
    child_profile: "פרופיל ילד",
    image_upload: "העלה תמונה",
    missed_recording: "ההקלטה לא בוצעה בזמן",
  },
  en: {
    home: "Home",
    family: "Family",
    record: "Record",
    data: "Data",
    alerts: "Alerts",
    vocabulary_count: "Vocabulary Count",
    mlu: "Mean Length of Utterance",
    interaction_fluency: "Interaction Fluency",
    add_child: "Add Child",
    edit_profile: "Edit Profile",
    settings: "Settings",
    mic_button: "Record",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    upload: "Upload",
    share: "Share",
    language: "Language",
    hebrew: "Hebrew",
    english: "English",
    notify_before: "Notify 5 minutes before",
    snooze: "Snooze",
    birthdate: "Birthdate",
    parent_profile: "Parent Profile",
    child_profile: "Child Profile",
    image_upload: "Upload Image",
    missed_recording: "Recording missed by scheduled time",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("he")

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL: language === "he", t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
