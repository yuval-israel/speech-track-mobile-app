"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setLanguage(language === "he" ? "en" : "he")}
      className="rounded-full"
    >
      <Globe className="h-4 w-4" />
    </Button>
  )
}
