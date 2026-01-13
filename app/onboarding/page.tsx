"use client"

import { useRouter } from "next/navigation"
import { Briefcase, Wrench, ArrowRight } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold">MaintainU</h1>
          <p className="text-muted-foreground">Choose your role to get started</p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          {/* Company Role */}
          <button
            onClick={() => handleRoleSelect("company")}
            className="w-full p-5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 text-left flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-semibold">Company</h2>
                </div>
                <p className="text-sm text-muted-foreground">I need maintenance services</p>
              </div>
              <ArrowRight
                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1"
                strokeWidth={1.5}
              />
            </div>
          </button>

          {/* Technician Role */}
          <button
            onClick={() => handleRoleSelect("technician")}
            className="w-full p-5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 text-left flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-semibold">Technician</h2>
                </div>
                <p className="text-sm text-muted-foreground">I provide maintenance services</p>
              </div>
              <ArrowRight
                className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors mt-1"
                strokeWidth={1.5}
              />
            </div>
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <button onClick={() => router.push("/login")} className="text-primary font-semibold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
