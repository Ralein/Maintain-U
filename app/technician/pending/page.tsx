"use client"

import { BiTimeFive, BiCheckCircle, BiArrowBack, BiRefresh } from "react-icons/bi"
import { useRouter } from "next/navigation"

export default function TechnicianPendingPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">

            {/* Visual */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="w-24 h-24 neumorphic rounded-full flex items-center justify-center text-yellow-500 relative z-10">
                    <BiTimeFive className="w-12 h-12 animate-spin-slow" />
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-3 tracking-tight">Application Pending</h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                Thanks for registering! Your profile is currently under review by our admin team. This usually takes 24-48 hours.
            </p>

            <div className="w-full max-w-sm space-y-3">
                {/* Status Card */}
                <div className="glass-card p-4 rounded-2xl flex items-center gap-4 text-left">
                    <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500">
                        <BiCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Documents Submitted</p>
                        <p className="text-xs text-muted-foreground">We received your ID and certificates.</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={() => window.location.reload()}
                    className="w-full neumorphic py-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-primary hover:text-primary/80 transition-all active:scale-95"
                >
                    <BiRefresh className="w-5 h-5" />
                    Check Status
                </button>

                <button
                    onClick={() => router.push("/login")}
                    className="w-full py-4 rounded-xl text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                    Back to Login
                </button>
            </div>
        </div>
    )
}
