"use client"

import { useRouter } from "next/navigation"
import { Clock, ShieldCheck, Home } from "lucide-react"
import { useEffect } from "react"
import { api } from "@/lib/api"

export default function PendingVerificationPage() {
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await api.refreshSession()
                if (res.success && res.status === 'active') {
                    // Redirect based on role
                    // For now default to company dashboard as requested
                    // Or let middleware handle it by pushing to root/dashboard
                    const path = res.role === 'technician' ? '/technician/dashboard' : '/company/dashboard';
                    router.push(path)
                }
            } catch (e) {
                // ignore
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl text-center space-y-6">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-orange-50 dark:ring-orange-950/20">
                    <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Verification In Progress</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        Your account is currently under review by our administrators. This security check ensures MaintainU remains a trusted community.
                    </p>
                </div>

                <div className="bg-white/50 dark:bg-card/50 rounded-2xl p-4 text-sm text-left border border-border/50">
                    <div className="flex gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                        <p className="font-semibold">What happens next?</p>
                    </div>
                    <p className="text-muted-foreground pl-8">
                        An admin will verify your details. Once approved, you will receive full access to the platform. This typically takes 24-48 hours.
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={() => router.push("/")}
                        className="w-full py-3.5 px-6 rounded-xl bg-white dark:bg-card border border-border hover:bg-muted/50 transition-all font-semibold flex items-center justify-center gap-2 group"
                    >
                        <Home className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}
