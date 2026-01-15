"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams?.get("role") as "company" | "technician"

  const [phone, setPhone] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleGetOTP = async () => {
    if (phone.length !== 10) return
    setIsLoading(true)
    try {
      const res = await api.sendOTP(phone)
      if (res.success) {
        setStep("otp")
        setResendTimer(30)
      }
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
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) return

    setIsLoading(true)
    // Simulate verification
    try {
      const res = await api.verifyOTP(phone, otpString) // Re-using verify logic to valid OTP
      if (res.success) {
        if (role === "company") {
          router.push(`/register/company?phone=${phone}`)
        } else {
          router.push(`/register/technician?phone=${phone}`)
        }
      } else if (res.error === 'pending') {
        // Even if pending, for signup flow we might want to let them fill details OR just show pending screen.
        // The current flow seems to want them to fill details first? 
        // Logic change: If pending, it means they just signed up.
        // Let's redirect to a "Registration Received" or just show a success state here.
        // But wait, the original flow was -> OTP -> Register Details -> Dashboard.
        // If we block at OTP, they can't fill details.
        // Let's assume for this mock that OTP *is* the signup for now as per this file's logic structure?
        // Actually looking at `SignupContent` it pushes to `/register/...` which likely fills more info.
        // We should probably allow them to proceed to Register page, and THEN prompt for Wait?
        // OR better: The requirement says "once admin verifies automatically enter OTP on signup or Login".
        // This implies they can't login.

        // Revised plan for Signup:
        // 1. OTP Verified (User created as pending)
        // 2. Show "Registration Successful. Please wait for specific verification."
        // 3. Do NOT redirect to /register/company yet? 
        // If /register/company is needed to capture Name/etc, then we might need to allow that step 
        // but block the final dashboard access?
        // But `verifyOTP` in `lib/api` now creates the user.

        // Let's stick to the prompt: "...enter a verification phase...".
        // So we stop here.

        // We can use a query param or just simple alert for now.
        // Or update UI state to show success message.
        router.push("/onboarding/pending") // We might need to create this page or just show toast
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => {
              if (step === "otp") {
                setStep("phone")
              } else {
                router.push("/onboarding")
              }
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span className="text-sm font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
            {role === "company" ? "Company Registration" : "Technician Registration"}
          </span>
        </div>

        {/* Main Content */}
        {step === "phone" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Enter Phone Number</h1>
              <p className="text-muted-foreground">We'll send you an OTP to verify</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="px-3 py-3 rounded-lg border border-border bg-muted font-semibold whitespace-nowrap">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="10 digit phone number"
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
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Enter OTP</h1>
              <p className="text-muted-foreground">Sent to +91 {phone}</p>
            </div>

            <div className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex gap-2 justify-between">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-11 rounded-lg border border-border bg-card text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    maxLength={1}
                  />
                ))}
              </div>

              {/* Resend Timer */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer}s</p>
                ) : (
                  <button
                    onClick={() => {
                      setStep("phone")
                      setOtp(["", "", "", "", "", ""])
                    }}
                    className="text-sm text-primary font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otp.join("").length !== 6 || isLoading}
                className="w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SignupScreen() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  )
}
