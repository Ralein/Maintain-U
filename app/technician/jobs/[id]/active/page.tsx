"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Phone, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { api, Job } from "@/lib/api"
import { toast } from "sonner"

export default function ActiveJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  const shareLocation = async (manual = false) => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error("No Geolocation"));
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      await api.checkIn(id, {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address: manual ? "Manual Update" : "Auto Check-in"
      });

      if (manual) toast.success("Location shared successfully");
    } catch (e) {
      console.error("Location error", e);
      if (manual) toast.error("Could not share location");
      // Fallback for auto
      if (!manual) await api.checkIn(id, { lat: 12.9716, lng: 77.5946, address: "Location Unavailable" });
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getJobById(id)
        if (res.job) {
          setJob(res.job as Job)
          // Always try to sync location if job is active or about to be active
          if (['Pending', 'Accepted', 'In Progress'].includes(res.job.status)) {
            await shareLocation(false);
          }
        }
      } catch (error) {
        toast.error("Failed to load job details")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!job) return <div className="p-6">Job not found</div>

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      {/* Header */}
      <div className="relative text-center mb-8">
        <button onClick={() => router.back()} className="absolute left-0 top-0 p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-xs text-muted-foreground mb-2">Currently Working</p>
        <h1 className="text-2xl font-bold">{job.company}</h1>
      </div>

      {/* Check In Status */}
      <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 mb-8 text-center flex flex-col items-center justify-center min-h-[120px]">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-3 animate-pulse">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
        </div>
        <p className="text-xl font-bold text-green-600 dark:text-green-400">ACTIVE SESSION</p>
        <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">You are currently checked in</p>
      </div>



      {/* Supervisor */}
      <div className="p-4 rounded-lg bg-card border border-border mb-6">
        <p className="text-xs text-muted-foreground mb-3">Site Supervisor</p>
        <div className="flex items-center justify-between">
          <p className="font-semibold">{job.supervisor || "N/A"}</p>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 fixed bottom-6 left-6 right-6">
        <button
          onClick={() => router.push(`/technician/jobs/${id}/signature`)}
          className="flex-1 py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Complete Work
        </button>
        <button
          onClick={() => router.push('/technician/dashboard')}
          className="flex-1 py-3 px-6 rounded-lg border border-border hover:bg-muted transition-colors font-semibold">
          Check Out
        </button>
      </div>
    </div>
  )
}
