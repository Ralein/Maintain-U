"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, ShieldCheck, CheckCircle2, Clock, Home, ArrowRight, FileText } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type Step = "phone" | "details" | "verify-required" | "waiting" | "approved"

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams?.get("role") as "company" | "technician" || "company"

  const [phone, setPhone] = useState(searchParams?.get("phone") || "")
  const [name, setName] = useState("")
  const [resume, setResume] = useState("")
  const [step, setStep] = useState<Step>("phone")
  const [isLoading, setIsLoading] = useState(false)

  // OTP Animation State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [animatingIndex, setAnimatingIndex] = useState(-1)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  // Start polling for admin approval when in waiting state
  useEffect(() => {
    if (step !== "waiting") return

    const pollForApproval = async () => {
      try {
        const res = await api.refreshSession()
        if (res.success && res.status === 'active') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          toast.success("Account approved!")
          setStep("approved")
        }
      } catch (e) {
        // Silently ignore
      }
    }

    pollingRef.current = setInterval(pollForApproval, 3000)
    pollForApproval()

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [step])

  // OTP Animation effect when approved
  useEffect(() => {
    if (step !== "approved") return

    // Generate random secure code
    const generatedOtp = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString())
    let index = 0

    const animateOtp = () => {
      if (index < 6) {
        setAnimatingIndex(index)
        setOtpDigits(prev => {
          const newDigits = [...prev]
          newDigits[index] = generatedOtp[index]
          return newDigits
        })
        index++
        setTimeout(animateOtp, 300)
      } else {
        // Animation complete, redirect to password setup
        setTimeout(() => {
          // New Requirement: "then open create password page"
          router.push("/setup-password")
        }, 800)
      }
    }

    setTimeout(animateOtp, 500)
  }, [step, router, role, phone])

  const handleGetOTP = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)
    try {
      const status = await api.checkUserStatus(phone)

      if (!status.exists) {
        if (role === 'technician') {
          setStep("details")
        } else {
          setStep("verify-required")
        }
      } else {
        if (status.status === 'pending') {
          setStep("waiting")
        } else if (status.status === 'active') {
          if (status.hasPassword) {
            toast.info("Account exists. Please login.")
            router.push(`/login?phone=${phone}`)
          } else {
            // Active but no password -> Show approved animation
            setStep("approved")
          }
        } else if (status.status === 'banned') {
          toast.error("Account suspended. Access denied.")
        } else if (status.status === 'rejected') {
          toast.error("Registration rejected. Please contact support.")
        }
      }
    } catch (e) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetailsSubmit = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (role === 'technician' && !resume.trim()) { toast.error("Please provide a resume link"); return; }
    setStep("verify-required")
  }

  const handleSubmitForVerification = async () => {
    setIsLoading(true)
    try {
      const res = await api.sendOTP(phone, role, { name, resume }) // Pass details

      if (res.error === 'pending' || (res.success === false && res.message.includes("pending"))) {
        toast.info(res.message || "Account submitted for verification")
        setStep("waiting")
      } else if (res.success) {
        // Should not happen for new users usually given checkUserStatus, but safety net
        if (res.error === 'pending') setStep("waiting")
        else {
          toast.info("Account already active. Please login.")
          router.push(`/login?phone=${phone}`)
        }
      } else {
        // If "pending" comes back as error key
        if (res.error === 'pending') {
          setStep("waiting")
        } else {
          toast.error(res.message || "Failed to submit")
        }
      }
    } catch (error) {
      toast.error("Failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetFlow = () => {
    setStep("phone")
    setPhone("")
    setOtpDigits(["", "", "", "", "", ""])
    setAnimatingIndex(-1)
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
        {/* Header content based on step */}
        <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2">
            {role === "technician" ? "Technician Registration" : "Company Registration"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {step === "phone" && "Get Started"}
            {step === "details" && "Technician Profile"}
            {step === "verify-required" && "Admin Verification"}
            {step === "waiting" && "Verification Pending"}
            {step === "approved" && "Verified!"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {step === "phone" && "Enter your phone number to begin"}
            {step === "details" && "Please provide your details below"}
            {step === "verify-required" && "One-time admin approval required"}
            {step === "waiting" && "Please wait for approval"}
            {step === "approved" && "Entering OTP automatically..."}
          </p>
        </div>

        {step === "approved" ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50 dark:ring-green-950/20">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Account Approved!</h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Your OTP is being entered automatically...
              </p>
            </div>

            {/* OTP Animation Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3 my-6 sm:my-8 min-h-[3.5rem] sm:min-h-[4rem]">
              {otpDigits.map((digit, index) => (
                digit ? (
                  <div
                    key={index}
                    className={`w-10 h-14 sm:w-12 sm:h-16 rounded-xl sm:rounded-2xl border flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-300 ${index === animatingIndex
                      ? "border-primary bg-primary/10 text-primary scale-110 ring-4 ring-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                      : "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                      }`}
                  >
                    <span className="animate-in zoom-in duration-200 slide-in-from-bottom-2">{digit}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        ) : step === "waiting" ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-orange-50 dark:ring-orange-950/20">
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 dark:text-orange-400 animate-pulse" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Verification In Progress</h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed px-2">
                Your account is currently under review. Please wait here while we verify your details.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 items-center justify-center text-[10px] sm:text-xs text-muted-foreground pt-1 sm:pt-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Checking for approval...</span>
            </div>
            <button
              onClick={resetFlow}
              className="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-white dark:bg-card border border-border hover:bg-muted/50 transition-all text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mt-4"
            >
              <Home className="w-4 h-4" />
              Back
            </button>
          </div>
        ) : step === "details" ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-purple-50 dark:ring-purple-950/20">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium ml-1">Resume Link (URL)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                />
                <p className="text-[10px] text-muted-foreground ml-1">Provide a link to your CV or Portfolio (Google Drive, LinkedIn, etc.)</p>
              </div>
            </div>

            <button
              onClick={handleDetailsSubmit}
              className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-purple-600 text-white text-sm sm:text-base font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={resetFlow}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Over
            </button>
          </div>
        ) : step === "verify-required" ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50 dark:ring-blue-950/20">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="bg-white/50 dark:bg-card/50 rounded-2xl p-4 text-xs sm:text-sm text-left border border-border/50">
              <div className="flex gap-3 items-center mb-3">
                <span className="font-semibold">Phone Number:</span>
                <span className="font-mono text-muted-foreground">+91 {phone}</span>
              </div>
              <p className="text-muted-foreground text-[10px] sm:text-xs">
                Click submit to send your request to the admin for approval.
              </p>
            </div>

            <button
              onClick={handleSubmitForVerification}
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-primary text-white text-sm sm:text-base font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit for Verification
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={resetFlow}
              className="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-white dark:bg-card border border-border hover:bg-muted/50 transition-all text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium ml-1">Phone Number</label>
              <div className="flex gap-2 sm:gap-3">
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-border bg-muted/50 text-sm sm:text-base font-semibold whitespace-nowrap text-muted-foreground">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm sm:text-base font-medium tracking-wide"
                  maxLength={10}
                />
              </div>
            </div>

            <button
              onClick={handleGetOTP}
              disabled={phone.length !== 10 || isLoading}
              className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-primary text-white text-sm sm:text-base font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Checking..." : "Get OTP"}
            </button>
          </div>
        )
        }
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
