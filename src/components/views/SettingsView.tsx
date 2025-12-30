"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, LogOut, User as UserIcon, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/api/types"

interface SettingsViewProps {
    user: User
    onLogout: () => void
}

export function SettingsView({ user, onLogout }: SettingsViewProps) {
    const { theme, setTheme } = useTheme()

    return (
        <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

            {/* Account Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.profile_image_url} />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                {user.full_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-medium text-lg">{user.full_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {user.email}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button variant="destructive" className="w-full sm:w-auto" onClick={onLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how the app looks on your device</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">Dark Mode</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme('light')}
                                className="rounded-full px-3"
                            >
                                <Sun className="h-4 w-4 mr-1" /> Light
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme('dark')}
                                className="rounded-full px-3"
                            >
                                <Moon className="h-4 w-4 mr-1" /> Dark
                            </Button>
                            <Button
                                variant={theme === 'system' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTheme('system')}
                                className="rounded-full px-3"
                            >
                                <Monitor className="h-4 w-4 mr-1" /> System
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-xs text-muted-foreground pt-8">
                <p>SpeechTrack v0.1.0</p>
            </div>
        </div>
    )
}
