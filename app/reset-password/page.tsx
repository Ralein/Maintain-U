"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Clock, ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"
import { requestPasswordResetAction, checkResetStatusAction, loginWithResetApprovalAction } from "@/lib/actions"
import { toast } from "sonner"

type Step = "input-phone" | "pending" | "reset-password"

export default function ResetPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>("input-phone")
    const [phone, setPhone] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
            }
        }
    }, [])

    // Poll for approval
    useEffect(() => {
        if (step !== "pending") return

        const pollForApproval = async () => {
            try {
                if (step === "pending") {
                    const res = await checkResetStatusAction(phone)
                    if (res.success && res.resetStatus === 'approved') {
                        if (pollingRef.current) clearInterval(pollingRef.current)
                        pollingRef.current = null
                        // Auto-login and redirect
                        await loginWithResetApprovalAction(phone)
                        toast.success("Reset Approved! Redirecting...")
                        router.push("/setup-password")
                    }
                }
            } catch (e) {
                // Silently ignore
            }
        }

        if (pollingRef.current) clearInterval(pollingRef.current)
        pollingRef.current = setInterval(pollForApproval, 3000)
        pollForApproval()

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [step, phone])

    const handleRequestReset = async () => {
        setErrorMessage("")
        if (phone.length !== 10) {
            toast.error("Enter a valid 10-digit phone number")
            return
        }

        setIsLoading(true)
        try {
            // Check status first
            const status = await checkResetStatusAction(phone)

            if (!status.success && status.message === "User not found") {
                setErrorMessage("No account available. Please Sign Up.")
                setIsLoading(false)
                return
            }

            if (status.resetStatus === 'approved') {
                // Auto-login and redirect
                await loginWithResetApprovalAction(phone)
                router.push("/setup-password")
            } else if (status.resetStatus === 'requested') {
                setStep("pending")
            } else {
                // Request reset
                const res = await requestPasswordResetAction(phone)
                if (res.success) {
                    setStep("pending")
                } else {
                    toast.error(res.message)
                }
            }
        } catch (e) {
            toast.error("Error processing request")
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/login")}
                    className="mb-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </button>

                {step === "input-phone" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto ring-4 ring-blue-50 dark:ring-blue-950/20 mb-4">
                                <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Forgot Password?</h1>
                            <p className="text-sm text-muted-foreground px-4">
                                Enter your registered phone number to request a password reset from the admin.
                            </p>
                        </div>

                        <div className="space-y-4">
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
                                {errorMessage && (
                                    <div className="flex items-center justify-center gap-2 p-3 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                                        <span className="text-xs font-medium text-center">{errorMessage}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleRequestReset}
                                disabled={phone.length !== 10 || isLoading}
                                className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isLoading ? "Sending Request..." : "Request Reset"}
                            </button>
                        </div>
                    </div>
                )}

                {step === "pending" && (
                    <div className="space-y-6 text-center animate-in fade-in duration-300">
                        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-yellow-50 dark:ring-yellow-950/20">
                            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">Awaiting Approval</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed px-4">
                                We've sent your request to the admin. Please stay on this page while we wait for approval.
                            </p>
                        </div>
                        <div className="flex gap-3 items-center justify-center text-xs text-muted-foreground pt-4 pb-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span>Checking status...</span>
                        </div>
                        <button
                            onClick={() => setStep("input-phone")}
                            className="text-sm text-primary hover:underline font-medium"
                        >
                            Cancel Request
                        </button>
                    </div>
                )}


            </div>
        </div>
    )
}
