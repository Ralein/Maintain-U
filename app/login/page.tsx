"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)

  const handleGetOTP = async () => {
    if (phone.length !== 10) return
    setIsLoading(true)
    try {
      const res = await api.sendOTP(phone)
      if (res.success) {
        setStep("otp")
        toast.success("OTP sent successfully")
      }
    } catch (error) {
      toast.error("Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`login-otp-${index + 1}`)?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) return
    setIsLoading(true)
    try {
      const res = await api.verifyOTP(phone, otpString)
      if (res.success) {
        toast.success(`Welcome back!`)
        if (res.role === "company") {
          router.push("/company/dashboard")
        } else if (res.role === "technician") {
          router.push("/technician/dashboard")
        } else if (res.role === "admin") {
          router.push("/admin/dashboard")
        }
      } else {
        if (res.error === 'pending') {
          router.push("/onboarding/pending")
        } else if (res.error === 'banned') {
          toast.error("Account suspended. Access denied.")
        } else if (res.error === 'rejected') {
          toast.error("Registration rejected. Please contact support.")
        } else {
          toast.error("Invalid OTP")
        }
      }
    } catch (error) {
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl">
        {/* Header */}
        <div className="mb-8 space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to MaintainU</p>
        </div>

        {step === "phone" ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium ml-1">Phone Number</label>
              <div className="flex gap-3">
                <div className="px-4 py-3 rounded-xl border border-border bg-muted/50 font-semibold whitespace-nowrap text-muted-foreground">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.slice(0, 10))}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium tracking-wide"
                  maxLength={10}
                />
              </div>

              <button
                onClick={handleGetOTP}
                disabled={phone.length !== 10 || isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Sending..." : "Get OTP"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <button
              onClick={() => {
                setStep("phone")
                setOtp(["", "", "", "", "", ""])
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors -ml-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to number
            </button>

            <div className="text-center mb-6">
              <p className="text-sm font-medium">Enter verification code</p>
              <p className="text-xs text-muted-foreground mt-1">Sent to +91 {phone}</p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-2 justify-between">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`login-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-12 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    maxLength={1}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otp.join("").length !== 6 || isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>
            </div>
          </div>
        )}

        {/* Signup Link */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button onClick={() => router.push("/onboarding")} className="text-primary font-bold hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
