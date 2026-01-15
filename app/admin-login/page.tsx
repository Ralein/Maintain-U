
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AdminLoginPage() {
    const router = useRouter()
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState<"phone" | "otp">("phone")
    const [isLoading, setIsLoading] = useState(false)

    const handleSendOTP = async () => {
        if (phone.length < 10) return
        setIsLoading(true)
        try {
            // We use the same generic sendOTP, or a specific one if needed
            await api.sendOTP(phone)
            setStep("otp")
            toast.success("Security Code sent")
        } catch {
            toast.error("Failed to send code")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogin = async () => {
        if (otp.length < 4) return
        setIsLoading(true)
        try {
            // use the specific admin login
            const res = await api.adminLogin(phone, otp)

            if (res.success) {
                toast.success("Secure Access Granted")
                router.push("/admin/dashboard")
            } else {
                toast.error(res.message || "Access Denied")
            }
        } catch {
            toast.error("Authentication Error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-900/50">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-white tracking-tight">Restricted Access</h1>
                        <p className="text-slate-400 text-sm mt-1">Authorized Personnel Only</p>
                    </div>

                    {step === "phone" ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Administration ID"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-center tracking-widest"
                            />
                            <button
                                onClick={handleSendOTP}
                                disabled={isLoading || phone.length < 5}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Identity"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <input
                                type="text"
                                placeholder="Security Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-center tracking-[1em] font-bold"
                                maxLength={6}
                            />
                            <button
                                onClick={handleLogin}
                                disabled={isLoading || otp.length < 4}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Authenticate"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
