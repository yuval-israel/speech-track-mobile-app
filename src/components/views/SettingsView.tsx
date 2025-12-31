import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, LogOut, User as UserIcon, Mail, Mic, CheckCircle, AlertCircle, X, Users, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { User, Child, ChildShareOut, ChildShareInviteOut } from "@/lib/api/types"
import { ParentVoiceRecorder } from "@/components/ParentVoiceRecorder"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface SettingsViewProps {
    user: User
    currentChild: Child | null
    onLogout: () => void
    onRefresh: () => Promise<void>
}

export function SettingsView({ user, currentChild, onLogout, onRefresh }: SettingsViewProps) {
    const { theme, setTheme } = useTheme()
    const [showVoiceSetup, setShowVoiceSetup] = useState(false)

    // Family Sharing State
    const [shares, setShares] = useState<ChildShareOut[]>([])
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteUsername, setInviteUsername] = useState("")
    const [inviteRole, setInviteRole] = useState<"viewer" | "parent">("viewer")
    const [isInviting, setIsInviting] = useState(false)

    // Pending Invitations State
    const [invitations, setInvitations] = useState<ChildShareInviteOut[]>([])

    useEffect(() => {
        fetchInvitations()
    }, [])

    const fetchInvitations = async () => {
        try {
            const data = await apiFetch<ChildShareInviteOut[]>('/children/share/invitations')
            setInvitations(data)
        } catch (error) {
            console.error("Failed to fetch invitations:", error)
        }
    }

    const handleAcceptInvite = async (childId: number) => {
        try {
            await apiFetch(`/children/${childId}/share/accept`, { method: 'POST' })
            toast.success("Invitation accepted")
            fetchInvitations()
            await onRefresh() // Refresh global state to show new child
        } catch (error) {
            console.error(error)
            toast.error("Failed to accept invitation")
        }
    }

    const handleDeclineInvite = async (childId: number) => {
        try {
            await apiFetch(`/children/${childId}/share/me`, { method: 'DELETE' })
            toast.success("Invitation declined")
            fetchInvitations()
        } catch (error) {
            console.error(error)
            toast.error("Failed to decline invitation")
        }
    }

    useEffect(() => {
        if (currentChild) {
            fetchShares()
        }
    }, [currentChild?.id])

    const fetchShares = async () => {
        if (!currentChild) return
        try {
            const data = await apiFetch<ChildShareOut[]>(`/children/${currentChild.id}/share`)
            setShares(data)
        } catch (error) {
            console.error("Failed to fetch shares:", error)
        }
    }

    const handleInvite = async () => {
        if (!currentChild || !inviteUsername) return

        setIsInviting(true)
        try {
            await apiFetch(`/children/${currentChild.id}/invite`, {
                method: 'POST',
                body: JSON.stringify({
                    email: inviteUsername,
                    role: inviteRole
                })
            })
            toast.success(`Invitation sent to ${inviteUsername}`)
            setInviteUsername("")
            setInviteRole("viewer") // Reset to default
            setIsInviteOpen(false)
            fetchShares()
        } catch (error) {
            console.error(error)
            toast.error("Failed to send invitation. Check username.")
        } finally {
            setIsInviting(false)
        }
    }

    const handleUpdateRole = async (username: string, newRole: "editor" | "spectator") => {
        if (!currentChild) return
        try {
            await apiFetch(`/children/${currentChild.id}/share/${username}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }) // Backend checks for 'role'
            })
            toast.success("Role updated successfully.")
            fetchShares()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update role")
        }
    }

    // ... (rest of the component)

    const handleVoiceSetupComplete = async () => {
        await onRefresh()
        setShowVoiceSetup(false)
    }

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

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-300">Pending Invitations</CardTitle>
                        <CardDescription>
                            You have been invited to view these profiles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {invitations.map((invite) => (
                            <div key={invite.child_id} className="flex items-center justify-between p-3 bg-white dark:bg-background rounded-lg border shadow-sm">
                                <div>
                                    <div className="font-medium">{invite.child_name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Invited by {invite.invited_by} • {invite.role}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleDeclineInvite(invite.child_id)}>
                                        Decline
                                    </Button>
                                    <Button size="sm" onClick={() => handleAcceptInvite(invite.child_id)}>
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Voice Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Parent Voice Profile</CardTitle>
                    <CardDescription>
                        This helps us identify you as "Speaker 1" (Mom/Dad) during recordings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${user.has_voice_profile ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Mic className={`w-5 h-5 ${user.has_voice_profile ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <div className="font-medium text-sm">My Voice Profile</div>
                                <div className={`text-xs flex items-center gap-1 ${user.has_voice_profile ? 'text-green-600' : 'text-red-500'}`}>
                                    {user.has_voice_profile ? (
                                        <>
                                            <CheckCircle className="w-3 h-3" /> Recorded
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-3 h-3" /> Missing
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowVoiceSetup(true)}>
                            {user.has_voice_profile ? "Re-record" : "Record Now"}
                        </Button>
                        <Dialog open={showVoiceSetup} onOpenChange={setShowVoiceSetup}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Parent Voice Profile</DialogTitle>
                                    <DialogDescription>
                                        Record your voice so we can distinguish you from your child.
                                    </DialogDescription>
                                </DialogHeader>
                                <ParentVoiceRecorder onComplete={handleVoiceSetupComplete} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            {/* Family Members Section */}
            {currentChild && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Family Members</span>
                            {currentChild.current_user_role !== 'spectator' && (
                                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Plus className="w-4 h-4 mr-1" /> Invite Parent
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite Parent</DialogTitle>
                                            <DialogDescription>
                                                Share access to <strong>{currentChild.name}</strong>'s profile with your spouse or partner.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    placeholder="Enter their email (username)..."
                                                    value={inviteUsername}
                                                    onChange={(e) => setInviteUsername(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="role">Role</Label>
                                                <select
                                                    id="role"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={inviteRole}
                                                    onChange={(e) => setInviteRole(e.target.value as "viewer" | "parent")}
                                                >
                                                    <option value="viewer">Viewer (Read Only)</option>
                                                    <option value="parent">Parent (Can Record & Edit)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleInvite} disabled={isInviting || !inviteUsername}>
                                                {isInviting ? "Sending..." : "Send Invite"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardTitle>
                        <CardDescription>
                            People with access to {currentChild.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Owner (Simulated since shares list might include owner or not depending on backend logic, typically owner IS included or handled separately. 
                            If logic: currently backend `list_child_shares` returns ALL links including owner? Let's assume yes or verify. 
                            Actually `list_child_shares` at backend returns ALL links. 
                         */}
                        {shares.length === 0 ? (
                            <div className="flex items-center gap-3 p-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{user.full_name} (You)</div>
                                    <div className="text-xs text-muted-foreground">Owner</div>
                                </div>
                            </div>
                        ) : (
                            shares.map((share) => (
                                <div key={share.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{share.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            {share.username} {share.username === user.email ? "(You)" : ""}
                                        </div>
                                        <div className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                                            <span>{share.status}</span>
                                        </div>
                                    </div>

                                    {/* Role Management Dropdown for Owner */}
                                    {currentChild.current_user_role === 'owner' && share.role !== 'owner' ? (
                                        <select
                                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                            value={share.role === 'editor' ? 'parent' : 'viewer'}
                                            onChange={(e) => handleUpdateRole(share.username, e.target.value === 'parent' ? 'editor' : 'spectator')}
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="parent">Parent</option>
                                        </select>
                                    ) : (
                                        <div className="text-xs text-muted-foreground capitalize mr-2">
                                            {share.role === 'editor' ? 'Parent' : share.role === 'spectator' ? 'Viewer' : 'Owner'}
                                        </div>
                                    )}

                                    {/* Only show delete if not self and if owner */}
                                    {share.username !== user.email && share.role !== 'owner' && currentChild.current_user_role === 'owner' && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            )
            }

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
        </div >
    )
}
