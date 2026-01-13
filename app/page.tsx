"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wrench } from "lucide-react"

import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function SplashScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding")
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 px-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm glass p-10 rounded-3xl flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <div className="relative w-20 h-20 bg-white dark:bg-card rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <Wrench className="w-10 h-10 text-primary" strokeWidth={2} />
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">MaintainU</h1>
          <p className="text-muted-foreground font-medium">Industrial Maintenance Platform</p>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary/30 rounded-full border-t-primary animate-spin" />
          {isLoading && <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Initializing</p>}
        </div>
      </div>
    </div>
  )
}
