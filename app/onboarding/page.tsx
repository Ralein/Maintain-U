"use client"

import { useRouter } from "next/navigation"
import { Briefcase, Wrench, ArrowRight, Building2 } from "lucide-react"

export default function OnboardingScreen() {
  const router = useRouter()

  const handleRoleSelect = (role: "company" | "technician") => {
    if (role === "company") {
      router.push("/signup?role=company")
    } else {
      router.push("/signup?role=technician")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-3xl shadow-xl">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-accent rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">MaintainU</h1>
          <p className="text-muted-foreground text-lg">Your maintenance partner</p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center mb-4">Choose your portal</p>

          {/* Company Role */}
          <button
            onClick={() => handleRoleSelect("company")}
            className="w-full p-4 rounded-2xl bg-white dark:bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg font-bold">Company</h2>
                <p className="text-sm text-muted-foreground">Request maintenance</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Technician Role */}
          <button
            onClick={() => handleRoleSelect("technician")}
            className="w-full p-4 rounded-2xl bg-white dark:bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg font-bold">Technician</h2>
                <p className="text-sm text-muted-foreground">Accept jobs</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        {/* Login Link */}
        <div className="pt-4 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => router.push("/login")} className="text-primary font-bold hover:underline">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
