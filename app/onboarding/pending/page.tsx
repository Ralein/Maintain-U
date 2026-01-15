
"use client"

import { Clock, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PendingVerificationPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                    <Clock className="w-10 h-10" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-bold tracking-tight">Verification Pending</h1>
                    <p className="text-muted-foreground">
                        Your registration was successful! We have sent your details to the admin for verification.
                    </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-xl text-sm text-left space-y-3">
                    <div className="flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Once verified, you will be able to log in with your phone number and OTP instantly.</span>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/login")}
                    className="w-full py-3 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    Return to Login
                </button>
            </div>
        </div>
    )
}
