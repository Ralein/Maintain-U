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
        toast.error("Invalid OTP")
      }
    } catch (error) {
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 space-y-3 text-center">
          <h1 className="text-4xl font-bold">MaintainU</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {step === "phone" ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="px-3 py-3 rounded-lg border border-border bg-muted font-semibold whitespace-nowrap">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="10 digit phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.slice(0, 10))}
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  maxLength={10}
                />
              </div>

              <button
                onClick={handleGetOTP}
                disabled={phone.length !== 10 || isLoading}
                className="w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Sending..." : "Get OTP"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setStep("phone")
                  setOtp(["", "", "", "", "", ""])
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <p className="text-sm text-muted-foreground">Enter OTP sent to +91 {phone}</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2 justify-between">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`login-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-11 rounded-lg border border-border bg-card text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    maxLength={1}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otp.join("").length !== 6 || isLoading}
                className="w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>
            </div>
          </div>
        )}

        {/* Signup Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button onClick={() => router.push("/onboarding")} className="text-primary font-semibold hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
