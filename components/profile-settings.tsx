"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, Moon, Sun, Laptop2, LogOut } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLanguage } from "@/contexts/language-context"
import { Upload, Bell, Globe } from "lucide-react"
import { format } from "date-fns"
import { Calendar as DateCalendar } from "@/components/ui/calendar"
import { useTheme } from "next-themes"

interface ProfileSettingsProps {
  type: "parent" | "child"
  onClose: () => void
  onLogout?: () => void
}

export function ProfileSettings({ type, onClose, onLogout }: ProfileSettingsProps) {
  const { t, language, setLanguage, isRTL } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [profileImage, setProfileImage] = useState(type === "parent" ? "👨‍🦰" : "👧")
  const [birthdate, setBirthdate] = useState<Date>(new Date("2020-01-15"))
  const [notifyBefore, setNotifyBefore] = useState(true)
  const [snoozeDuration, setSnoozeDuration] = useState(5)
  const [name, setName] = useState(type === "parent" ? "Sarah" : "Emma")

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      console.log("Image uploaded")
    }
    input.click()
  }

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <h1 className="text-2xl font-bold">{type === "parent" ? t("parent_profile") : t("child_profile")}</h1>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>

      <div className={`px-4 py-6 space-y-4 ${isRTL ? "rtl" : "ltr"}`}>
        {/* Profile Picture Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl">{profileImage}</div>
              <Button onClick={handleImageUpload} variant="outline" className="rounded-full bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                {t("image_upload")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Name Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Name</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent ${isRTL ? "text-right" : ""}`}
            />
          </CardContent>
        </Card>

        {/* Birthdate Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t("birthdate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal rounded-xl ${!birthdate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdate ? format(birthdate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DateCalendar
                  mode="single"
                  selected={birthdate}
                  onSelect={(date) => date && setBirthdate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("language")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={`flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 ${isRTL ? "flex-row-reverse" : ""}`}
              onClick={() => setLanguage("he")}
            >
              <span>עברית (Hebrew)</span>
              <input type="radio" name="language" checked={language === "he"} readOnly />
            </div>
            <div
              className={`flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 ${isRTL ? "flex-row-reverse" : ""}`}
              onClick={() => setLanguage("en")}
            >
              <span>English</span>
              <input type="radio" name="language" checked={language === "en"} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={`flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 ${isRTL ? "flex-row-reverse" : ""}`}
              onClick={() => setTheme("light")}
            >
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </div>
              <input type="radio" name="theme" checked={theme === "light"} readOnly />
            </div>
            <div
              className={`flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 ${isRTL ? "flex-row-reverse" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </div>
              <input type="radio" name="theme" checked={theme === "dark"} readOnly />
            </div>
            <div
              className={`flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 ${isRTL ? "flex-row-reverse" : ""}`}
              onClick={() => setTheme("system")}
            >
              <div className="flex items-center gap-2">
                <Laptop2 className="h-4 w-4" />
                <span>System</span>
              </div>
              <input type="radio" name="theme" checked={theme === "system"} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className="text-sm">{t("notify_before")}</span>
              <Switch checked={notifyBefore} onCheckedChange={setNotifyBefore} />
            </div>

            {notifyBefore && (
              <div className={`space-y-2 p-3 rounded-xl bg-muted/30 border border-border ${isRTL ? "text-right" : ""}`}>
                <label className="text-sm font-medium">{t("snooze")} Duration</label>
                <select
                  value={snoozeDuration}
                  onChange={(e) => setSnoozeDuration(Number.parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent ${isRTL ? "text-right" : ""}`}
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button onClick={onClose} className="flex-1 rounded-full bg-accent hover:bg-accent/90">
            Save Changes
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-full bg-transparent">
            Cancel
          </Button>
        </div>

        {type === "parent" && onLogout && (
          <Button
            onClick={onLogout}
            className="w-full rounded-full mt-6 bg-destructive/90 hover:bg-destructive text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        )}
      </div>
    </div>
  )
}
