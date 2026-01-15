"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { ApprovalPoller } from "./approval-poller"

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
      const res = await api.sendOTP(phone, role)
      if (res.success) {
        setStep("otp") // Now means "waiting"
      }
    } finally {
      setIsLoading(false)
    }
  }

  // OTP handling removed, replaced by Poller component below
  // keeping empty functions/state to avoid breakages if references exist, 
  // but strictly we just deleted the UI that used them.


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
            {role === "technician" ? "Technician Registration" : "Company Registration"}
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
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-orange-600 dark:text-orange-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Waiting for Approval</h1>
              <p className="text-muted-foreground">
                An admin is verifying your phone number (+91 {phone}).<br />
                Please wait...
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl border border-border text-sm text-center">
              <p>Once verified, you will be automatically redirected to complete your registration.</p>
            </div>

            <ApprovalPoller phone={phone} role={role} />
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
