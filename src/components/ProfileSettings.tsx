"use client"

import type { User } from "../types/api"
import { X, LogOut } from "lucide-react"

interface ProfileSettingsProps {
  user: User
  onClose: () => void
  onLogout: () => void
}

import { useLanguage } from "@/contexts/language-context"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function ProfileSettings({ user, onClose, onLogout }: ProfileSettingsProps) {
  const { language, setLanguage, t, dir } = useLanguage()

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t("nav.settings")}</h1>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Profile</h2>

          <div className="flex items-center gap-4">
            <img
              src={user.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`}
              alt={user.full_name}
              className="h-20 w-20 rounded-full"
            />
            <div>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("settings.language")}</h2>
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-medium">English / עברית</span>
            </div>
            <Switch
              checked={language === 'he'}
              onCheckedChange={(checked) => setLanguage(checked ? 'he' : 'en')}
            />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full rounded-2xl bg-destructive hover:bg-destructive/90 text-white h-12 flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {t("settings.logout")}
        </button>
      </div>
    </div>
  )
}
