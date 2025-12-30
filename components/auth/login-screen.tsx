"use client"

import { useState } from "react"
import { Mail, Lock, Chrome, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { apiFetch } from "@/lib/api/client"
import { Token } from "@/lib/api/types"
import { toast } from "sonner"

interface LoginScreenProps {
  onSuccess: () => void
  onRegisterClick: () => void
}

export function LoginScreen({ onSuccess, onRegisterClick }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const data = await apiFetch<Token>('/auth/token', {
        method: 'POST',
        body: formData,
      });

      localStorage.setItem('access_token', data.access_token);
      toast.success("Logged in successfully");
      onSuccess();
    } catch (error) {
      const isUnauthorized = error instanceof Error && (error.message === 'Unauthorized' || error.message.includes('401'));

      if (isUnauthorized) {
        toast.error("Incorrect email or password", {
          description: "Don't have an account yet?",
          action: {
            label: "Sign Up",
            onClick: onRegisterClick
          },
          duration: 5000,
        });
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to login");
      }
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
          <h1 className="text-2xl font-bold text-foreground">SpeechTrack</h1>
          <p className="text-sm text-muted-foreground mt-2">Track your child's speech development</p>
        </div>

        {/* Email Input */}
        <div className="mb-4 space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6 space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={isLoading || !email || !password}
          className="w-full rounded-xl h-11 font-medium mb-4"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button variant="outline" className="rounded-xl h-10 bg-transparent">
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
          <Button variant="outline" className="rounded-xl h-10 bg-transparent">
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </Button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <button onClick={onRegisterClick} className="text-accent font-medium hover:underline">Sign up</button>
        </p>
      </Card>
    </div>
  )
}
