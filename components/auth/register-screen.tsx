"use client"

import { useState } from "react"
import { Mail, Lock, User, Eye, EyeOff, Check, X, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
// VoiceStampFlow import removed as it is no longer needed here

interface RegisterScreenProps {
    onSuccess: () => void
    onLoginClick: () => void
}

export function RegisterScreen({ onSuccess, onLoginClick }: RegisterScreenProps) {
    // Removed "step" state since we don't need to switch screens anymore
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Password requirements
    const requirements = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "Lowercase letter", valid: /[a-z]/.test(password) },
        { label: "Number", valid: /\d/.test(password) },
        { label: "Special character", valid: /[^\w\s]/.test(password) },
    ]

    const allValid = requirements.every(r => r.valid)

    const handleRegister = async () => {
        if (!allValid) {
            toast.error("Please meet all password requirements")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            // 1. Register User
            await apiFetch('/users/', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password
                })
            });

            toast.success("Account created successfully! Logging in...");

            // 2. Auto Login to get Token
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const data = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/token', {
                method: 'POST',
                body: formData,
            });

            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // 3. Immediately go to Dashboard (Skipping Voice Setup)
            onSuccess()

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <Card className="w-full max-w-md p-8 shadow-lg">
                {/* Logo & Title */}
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">ST</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
                    <p className="text-sm text-muted-foreground mt-2">Start tracking speech development</p>
                </div>

                {/* Username Input */}
                <div className="mb-4 space-y-2">
                    <label className="text-sm font-medium text-foreground">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="mb-4 space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-20 rounded-xl"
                        />
                        <div className="absolute right-3 top-3 flex gap-2">
                            <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            {showPassword && (
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(password)
                                        toast.success("Password copied")
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Requirements List */}
                    <div className="grid grid-cols-1 gap-1 mt-2">
                        {requirements.map((req, i) => (
                            <div key={i} className={`flex items-center text-xs ${req.valid ? "text-green-600" : "text-muted-foreground"}`}>
                                {req.valid ? <Check className="w-3 h-3 mr-1" /> : <div className="w-3 h-3 mr-1" />}
                                {req.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confirm Password Input */}
                <div className="mb-6 space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 rounded-xl"
                        />
                        <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Register Button */}
                <Button
                    onClick={handleRegister}
                    disabled={isLoading || !username || !password || !confirmPassword || !allValid}
                    className="w-full rounded-xl h-11 font-medium mb-4"
                >
                    {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>

                {/* Login Link */}
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account? <button onClick={onLoginClick} className="text-accent font-medium hover:underline">Log in</button>
                </p>
            </Card>
        </div>
    )
}
