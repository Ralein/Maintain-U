"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function SetupPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    // Check if user should be on this page
    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await api.refreshSession()
                if (!res.success) {
                    // Not logged in
                    router.push("/login")
                    return
                }

                if (res.status !== 'active') {
                    // Not approved yet
                    router.push("/login")
                    return
                }

                if (res.hasPassword && res.resetStatus !== 'approved') {
                    // Already has password and NOT in reset mode
                    if (res.name === "New User") {
                        router.push("/register/company")
                    } else {
                        const path = res.role === 'technician' ? '/technician/dashboard' : '/company/dashboard'
                        router.push(path)
                    }
                    return
                }

                // User is active and needs to set password
                setIsChecking(false)
            } catch (e) {
                router.push("/login")
            }
        }

        checkUser()
    }, [router])

    const passwordStrength = () => {
        if (password.length === 0) return { level: 0, text: "", color: "" }
        if (password.length < 8) return { level: 1, text: "Too short", color: "bg-red-500" }
        if (password.length < 12) return { level: 2, text: "Fair", color: "bg-yellow-500" }
        return { level: 3, text: "Strong", color: "bg-green-500" }
    }

    const strength = passwordStrength()

    const handleSubmit = async () => {
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            const res = await api.setPassword(password)
            if (res.success) {
                toast.success("Password set successfully! Please login with your new password.")
                // Redirect to login page
                router.push("/login")
            } else {
                toast.error(res.message || "Failed to set password")
            }
        } catch (e) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 rounded-full border-t-primary animate-spin"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl">
                {/* Header */}
                <div className="text-center mb-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50 dark:ring-green-950/20">
                        <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Account Verified!</h1>
                        <p className="text-muted-foreground text-sm">
                            Create a secure password to protect your account
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <div className="space-y-1 px-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-all ${strength.level >= level ? strength.color : 'bg-muted'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs ${strength.level <= 1 ? 'text-red-500' :
                                    strength.level === 2 ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                    {strength.text}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        {confirmPassword.length > 0 && (
                            <div className="flex items-center gap-1.5 px-1">
                                {password === confirmPassword ? (
                                    <>
                                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                        <span className="text-xs text-green-600">Passwords match</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-red-500">Passwords do not match</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Requirements */}
                    <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-2">Password requirements:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                            <li className={password.length >= 8 ? "text-green-600" : ""}>
                                At least 8 characters
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={password.length < 8 || password !== confirmPassword || isLoading}
                        className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Setting Password..." : "Create Password"}
                    </button>
                </div>
            </div>
        </div>
    )
}
