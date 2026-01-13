"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { api, Job } from "@/lib/api"
import { ArrowLeft, MapPin, Calendar, Clock, Phone, Loader2, PlayCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getJobById(id)
        if (res.job) {
          setJob(res.job)
        }
      } catch (error) {
        toast.error("Failed to load job")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleAccept = async () => {
    setActionLoading(true)
    try {
      // Simply update status locally for mock
      // In real API, api.acceptJob(id) would be called
      await api.updateJobStatus(id, "Accepted")
      setJob(prev => prev ? ({ ...prev, status: "Accepted" }) : null)
      toast.success("Job accepted")
    } catch (e) {
      toast.error("Failed to accept job")
    } finally {
      setActionLoading(false)
    }
  }

  const handleStart = () => {
    router.push(`/technician/jobs/${id}/active`)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  if (!job) return <div className="p-6">Job not found</div>

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6 relative">
        <button onClick={() => router.back()} className="absolute left-0 top-0 p-2 -ml-2 -mt-1 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Job Details</p>
          <h1 className="text-xl font-bold">{job.id}</h1>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-8">
        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${job.status === 'Completed' ? 'bg-green-100 text-green-700' :
          job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
            job.status === 'Accepted' ? 'bg-purple-100 text-purple-700' :
              'bg-yellow-100 text-yellow-700'
          }`}>
          {job.status}
        </span>
      </div>

      {/* Info Cards */}
      <div className="space-y-4 mb-24">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Company</p>
          <h2 className="text-lg font-bold mb-2">{job.company}</h2>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{job.address || job.location || "Location not provided"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-semibold text-sm">{job.date || "Today"}</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <Clock className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="font-semibold text-sm">{job.time || "09:00 AM"}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Task Description</p>
          <p className="text-sm leading-relaxed">{job.description || `Required service: ${job.service}`}</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Site Supervisor</p>
            <p className="font-semibold">{job.supervisor || "N/A"}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="fixed bottom-6 left-6 right-6">
        {job.status === 'Pending' ? (
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Accept Job
          </button>
        ) : job.status === 'Accepted' || job.status === 'In Progress' ? (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <PlayCircle className="w-5 h-5" />
            {job.status === 'In Progress' ? 'Resume Work' : 'Start Work'}
          </button>
        ) : (
          <button disabled className="w-full py-4 bg-muted text-muted-foreground rounded-xl font-bold text-lg cursor-not-allowed">
            Job Completed
          </button>
        )}
      </div>
    </div>
  )
}
