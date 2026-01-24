import { useState } from "react"
import { User, Lock, Chrome, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { apiFetch } from "@/lib/api/client"
import { Token } from "@/lib/api/types"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/language-context"

interface LoginScreenProps {
  onSuccess: () => void
  onRegisterClick: () => void
}

export function LoginScreen({ onSuccess, onRegisterClick }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { t, dir } = useLanguage()

  const handleLogin = async () => {
    console.log("Starting login...")
    setIsLoading(true)
    try {
      console.log("Sending request...")
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const data = await apiFetch<Token>('/auth/token', {
        method: 'POST',
        body: formData,
      });

      console.log("Login success", data)
      localStorage.setItem('access_token', data.access_token);
      toast.success("Logged in successfully");
      onSuccess();
    } catch (error) {
      console.error("Login caught error", error)
      const isUnauthorized = error instanceof Error && (error.message === 'Unauthorized' || error.message.includes('401'));

      if (isUnauthorized) {
        console.log("Handling unauthorized error")
        try {
          toast.error("Incorrect username or password", {
            description: "Don't have an account yet?",
            action: {
              label: "Sign Up",
              onClick: onRegisterClick
            },
            duration: 5000,
          });
        } catch (toastErr) {
          console.error("Toast failed", toastErr)
        }
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to login");
      }
    } finally {
      console.log("Login finally block - resetting loading state")
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir={dir}>
      <Card className="w-full max-w-md p-8 shadow-lg">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">ST</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("login.title")}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t("login.subtitle")}</p>
        </div>

        {/* Username Input */}
        <div className="mb-4 space-y-2">
          <label className="text-sm font-medium text-foreground">{t("login.username")}</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6 space-y-2">
          <label className="text-sm font-medium text-foreground">{t("login.password")}</label>
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
          disabled={isLoading || !username || !password}
          className="w-full rounded-xl h-11 font-medium mb-4"
        >
          {isLoading ? "Logging in..." : t("login.button")}
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-card text-muted-foreground">{t("login.or")}</span>
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
          {t("login.signup_prompt")} <button onClick={onRegisterClick} className="text-accent font-medium hover:underline">{t("login.signup_link")}</button>
        </p>
      </Card>
    </div>
  )
}
