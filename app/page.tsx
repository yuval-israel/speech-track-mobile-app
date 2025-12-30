"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/auth/login-screen"
import { RegisterScreen } from "@/components/auth/register-screen"
import { DashboardContainer } from "@/src/components/DashboardContainer"

type AppState = "loading" | "login" | "register" | "app"

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("loading")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      setAppState("app")
    } else {
      setAppState("login")
    }
  }, [])

  const handleLoginSuccess = () => setAppState("app")
  const handleLogout = () => {
    localStorage.removeItem("access_token")
    setAppState("login")
  }
  const handleRegisterClick = () => setAppState("register")
  const handleRegisterSuccess = () => setAppState("app")

  return (
    <div className="min-h-screen bg-background">
      {appState === "loading" && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
      {appState === "login" && <LoginScreen onSuccess={handleLoginSuccess} onRegisterClick={handleRegisterClick} />}
      {appState === "register" && <RegisterScreen onSuccess={handleRegisterSuccess} onLoginClick={handleLogout} />}
      {appState === "app" && <DashboardContainer onLogout={handleLogout} />}
    </div>
  )
}
