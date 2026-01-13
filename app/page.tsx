"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wrench } from "lucide-react"

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <Wrench className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">MaintainU</h1>
          <p className="text-muted-foreground">Industrial Maintenance Platform</p>
        </div>

        {/* Loading Indicator */}
        <div className="pt-4">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-border rounded-full border-t-primary animate-spin"></div>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Initializing...</p>}
      </div>
    </div>
  )
}
