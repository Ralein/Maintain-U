"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Phone, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { api, Job } from "@/lib/api"
import { toast } from "sonner"

export default function ActiveJobPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [status, setStatus] = useState<string>("Work in progress")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getJobById(params.id)
        if (res.job) {
          setJob(res.job)
          // Ensure job is marked as In Progress if not already
          if (res.job.status === 'Pending' || res.job.status === 'Accepted') {
            await api.checkIn(params.id, "Mock Location")
          }
        }
      } catch (error) {
        toast.error("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        const newSeconds = prev.seconds + 1
        if (newSeconds === 60) {
          return { ...prev, minutes: prev.minutes + 1, seconds: 0 }
        }
        if (prev.minutes === 60) {
          return { hours: prev.hours + 1, minutes: 0, seconds: 0 }
        }
        return { ...prev, seconds: newSeconds }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusUpdate = async (newStatus: string) => {
    setStatus(newStatus)
    try {
      await api.updateJobStatus(params.id, "In Progress", newStatus)
      toast.success("Status updated")
    } catch (e) {
      console.error("Failed to update status")
    }
  }

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
      <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 mb-8 text-center">
        <p className="text-xs text-muted-foreground mb-2">Status</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={1.5} />
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">CHECKED IN</p>
        </div>
        <p className="text-4xl font-bold text-green-600 dark:text-green-400 font-mono">
          {String(timer.hours).padStart(2, "0")}:{String(timer.minutes).padStart(2, "0")}:
          {String(timer.seconds).padStart(2, "0")}
        </p>
      </div>

      {/* Location */}
      <div className="p-4 rounded-lg bg-card border border-border mb-6">
        <p className="text-xs text-muted-foreground mb-2">Location</p>
        <p className="font-semibold mb-4">{job.location}</p>
        <button className="w-full py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
          Share Location
        </button>
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

      {/* Status Update */}
      <div className="p-4 rounded-lg bg-card border border-border mb-8">
        <p className="text-xs text-muted-foreground mb-3">Current Status</p>
        <div className="space-y-2">
          {["Work in progress", "Taking break", "Waiting for parts", "Issue/Problem"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusUpdate(s)}
              className={`w-full py-3 px-3 rounded-lg text-left font-semibold text-sm transition-colors ${status === s
                ? "bg-primary/20 border border-primary/50 text-primary dark:text-primary"
                : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 fixed bottom-6 left-6 right-6">
        <button
          onClick={() => router.push(`/technician/jobs/${params.id}/signature`)}
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
