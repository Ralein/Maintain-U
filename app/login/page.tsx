"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Clock, ShieldCheck, Home, Lock, Eye, EyeOff, Phone, ArrowRight, CheckCircle2, Building2, Wrench } from "lucide-react"
import { api } from "@/lib/api"
import { requestPasswordResetAction, checkResetStatusAction, completePasswordResetAction } from "@/lib/actions"
import { toast } from "sonner"

type Step = "login" | "verify-required" | "waiting" | "approved"

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"company" | "technician">("company")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<Step>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // OTP Animation State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [animatingIndex, setAnimatingIndex] = useState(-1)

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
        if (step === "waiting") {
          const res = await api.refreshSession()
          if (res.success && res.status === 'active') {
            if (pollingRef.current) clearInterval(pollingRef.current)
            pollingRef.current = null
            toast.success("Account approved!")
            setStep("approved")
          }
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    }

    // Start polling every 3 seconds
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(pollForApproval, 3000)
    // Also poll immediately
    pollForApproval()

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [step, router])

  // OTP Animation effect when approved
  useEffect(() => {
    if (step !== "approved") return

    const mockOtp = ["4", "7", "2", "8", "1", "5"]
    let index = 0

    const animateOtp = () => {
      if (index < 6) {
        setAnimatingIndex(index)
        setOtpDigits(prev => {
          const newDigits = [...prev]
          newDigits[index] = mockOtp[index]
          return newDigits
        })
        index++
        setTimeout(animateOtp, 300)
      } else {
        // Animation complete, wait a moment then redirect
        setTimeout(() => {
          router.push("/setup-password")
        }, 800)
      }
    }

    // Start animation after a brief delay
    setTimeout(animateOtp, 500)
  }, [step, router])

  const handleLogin = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }
    setErrorMessage("")

    if (!password) {
      toast.error("Please enter your password")
      return
    }

    setIsLoading(true)
    try {
      const res = await api.loginWithPassword(phone, password)

      if (res.success) {
        toast.success("Welcome back!")
        if (res.role === "company") {
          router.push("/company/dashboard")
        } else if (res.role === "technician") {
          router.push("/technician/dashboard")
        } else if (res.role === "admin") {
          router.push("/admin/dashboard")
        }
      } else {
        if (res.error === 'pending') {
          toast.info(res.message)
          setStep("waiting")
        } else if (res.error === 'no_password') {
          toast.info("Please set up your password")
          router.push("/setup-password")
        } else if (res.error === 'banned') {
          toast.error("Account suspended. Access denied.")
        } else if (res.error === 'rejected') {
          toast.error("Registration rejected. Please contact support.")
        } else if (res.error === 'not_found') {
          setErrorMessage("No account available. Please Sign Up to continue.")
        } else {
          toast.error(res.message || "Login failed")
        }
      }
    } catch (error) {
      toast.error("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // When user clicks Get OTP, show verify-required step
  const handleGetOTP = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)
    try {
      const status = await api.checkUserStatus(phone)

      if (!status.exists) {
        // New User -> Verification Required
        setStep("verify-required")
      } else {
        // Existing User Logic
        if (status.status === 'pending') {
          setStep("waiting")
        } else if (status.status === 'active') {
          if (status.hasPassword) {
            toast.info("Account exists. Please login with your password.")
            setStep("login")
          } else {
            // Active but no password -> Show approved animation then go to setup
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

  // When user clicks Submit for Verification
  const handleSubmitForVerification = async () => {
    setIsLoading(true)
    try {
      const res = await api.sendOTP(phone, role)

      if (res.error === 'pending') {
        toast.info(res.message || "Account submitted for verification")
        setStep("waiting")
      } else if (res.success) {
        // User already exists and is active
        toast.info("Account exists. Please login with your password.")
        setStep("login")
      } else {
        toast.error(res.message || "Failed to submit")
      }
    } catch (error) {
      toast.error("Failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetFlow = () => {
    setStep("login")
    setPhone("")
    setPassword("")
    setOtpDigits(["", "", "", "", "", ""])
    setAnimatingIndex(-1)
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const handleForgotPassword = () => {
    router.push("/reset-password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl">
        {/* Header */}
        <div className="mb-8 space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {step === "login" && "Welcome Back"}
            {step === "verify-required" && "Admin Verification Required"}
            {step === "waiting" && "Verification Pending"}
            {step === "approved" && "Verified!"}
          </h1>
          <p className="text-muted-foreground">
            {step === "login" && "Sign in to continue to MaintainU"}
            {step === "verify-required" && "Your account requires admin verification"}
            {step === "waiting" && "Please wait for admin approval"}
            {step === "approved" && "Entering OTP automatically..."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/30 rounded-full border-t-primary animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Processing request...</p>
          </div>
        ) : step === "approved" ? (
          /* OTP Animation Screen */
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50 dark:ring-green-950/20">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Account Approved!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your OTP is being entered automatically...
              </p>
            </div>

            {/* OTP Animation Boxes */}
            <div className="flex justify-center gap-2 my-8">
              {otpDigits.map((digit, index) => (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 ${index === animatingIndex
                    ? "border-primary bg-primary/10 scale-110"
                    : digit
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-border bg-card"
                    }`}
                >
                  {digit && (
                    <span className="animate-in zoom-in duration-200">{digit}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 items-center justify-center text-xs text-muted-foreground pt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Verifying...</span>
            </div>
          </div>
        ) : step === "waiting" ? (
          /* Waiting/Pending Screen */
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-orange-50 dark:ring-orange-950/20">
              <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Verification In Progress</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your account is currently under review by our administrators. Please wait here while we verify your details.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-card/50 rounded-2xl p-4 text-sm text-left border border-border/50">
              <div className="flex gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="font-semibold">What happens next?</p>
              </div>
              <p className="text-muted-foreground pl-8">
                An admin will verify your details. Once approved, you will be automatically redirected to set up your password.
              </p>
            </div>

            <div className="flex gap-3 items-center justify-center text-xs text-muted-foreground pt-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Checking for approval...</span>
            </div>

            <button
              onClick={resetFlow}
              className="w-full py-3 px-6 rounded-xl bg-white dark:bg-card border border-border hover:bg-muted/50 transition-all font-semibold flex items-center justify-center gap-2 mt-4"
            >
              <Home className="w-4 h-4" />
              Try Different Number
            </button>
          </div>
        ) : step === "verify-required" ? (
          /* Admin Verification Required Screen */
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50 dark:ring-blue-950/20">
              <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-foreground">New Account Verification</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To ensure platform security, all new accounts require administrator verification before access is granted.
              </p>
            </div>

            <div className="bg-white/50 dark:bg-card/50 rounded-2xl p-4 text-sm text-left border border-border/50">
              <div className="flex gap-3 items-center mb-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">Phone Number:</span>
                <span className="font-mono text-muted-foreground">+91 {phone}</span>
              </div>
              <hr className="border-border/50 my-3" />
              <p className="text-muted-foreground text-xs">
                By clicking "Submit for Verification", your phone number will be sent to our administrators for approval. You'll be notified once your account is verified.
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">I am registering as a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("company")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === "company"
                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                    : "bg-white/50 dark:bg-card/50 border-border text-muted-foreground hover:bg-muted/50 hover:border-border/80"
                    }`}
                >
                  <Building2 className="w-6 h-6" />
                  <span className="text-xs font-bold">Company</span>
                </button>
                <button
                  onClick={() => setRole("technician")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === "technician"
                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                    : "bg-white/50 dark:bg-card/50 border-border text-muted-foreground hover:bg-muted/50 hover:border-border/80"
                    }`}
                >
                  <Wrench className="w-6 h-6" />
                  <span className="text-xs font-bold">Technician</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmitForVerification}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <ShieldCheck className="w-4 h-4" />
              Submit for Verification
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={resetFlow}
              className="w-full py-3 px-6 rounded-xl bg-white dark:bg-card border border-border hover:bg-muted/50 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Back
            </button>
          </div>
        ) : (
          /* Login Form */
          <div className="space-y-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Phone Number</label>
              <div className="flex gap-3">
                <div className="px-4 py-3 rounded-xl border border-border bg-muted/50 font-semibold whitespace-nowrap text-muted-foreground">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium tracking-wide"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={phone.length !== 10 || !password || isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        )
        }

        {/* Forgot Password Link (Only in Login mode) */}
        {step === "login" && (
          <div className="text-right mt-2 space-y-1">
            <button
              onClick={handleForgotPassword}
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot Password?
            </button>
            {errorMessage && (
              <div className="flex items-center justify-center gap-2 p-2 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 animate-in slide-in-from-right-2">
                <span className="text-[10px] font-medium text-center">{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Sign Up Link */}
        {step === "login" && (
          <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={handleGetOTP}
                disabled={phone.length !== 10 || isLoading}
                className="text-primary font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}


      </div>
    </div>
  )
}
