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
          setJob(res.job as Job)
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
      await api.acceptJob(id)
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
    <div className="min-h-screen app-gradient flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <span className="text-sm font-bold text-muted-foreground animate-pulse">Loading job details...</span>
    </div>
  )

  if (!job) return (
    <div className="min-h-screen app-gradient flex items-center justify-center">
      <div className="glass-card p-10 rounded-3xl text-center">
        <p className="font-bold text-muted-foreground">Job not found</p>
        <button onClick={() => router.back()} className="text-primary text-sm font-bold mt-4">Go Back</button>
      </div>
    </div>
  )

  const isCompleted = job.status === 'Completed';
  const isInProgress = job.status === 'In Progress' || job.status === 'In_Progress';

  return (
    <div className="min-h-screen pb-32 app-gradient">
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-6 glass border-b-0 mb-8 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all shrink-0 active:scale-90">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Job Order</p>
          <h1 className="text-sm font-black text-foreground mt-1">{job.id}</h1>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Status Card */}
        <div className="flex justify-center mb-4">
          <div className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border shadow-sm ${isCompleted
              ? 'bg-green-500/10 text-green-600 border-green-500/20'
              : isInProgress
                ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-orange-500/5'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}>
            {job.status.replace('_', ' ')}
          </div>
        </div>

        {/* Main Info Card */}
        <section className="glass-card p-6 rounded-[2rem] border-t border-white/20">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Client Company</p>
          <h2 className="text-2xl font-black text-foreground mb-4 leading-tight">{job.company}</h2>

          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground/80 leading-snug">{job.address || job.location || "Location not provided"}</p>
          </div>
        </section>

        {/* Schedule Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-3xl">
            <Calendar className="w-5 h-5 text-primary mb-3" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</p>
            <p className="font-bold text-sm text-foreground mt-1">{job.date ? new Date(job.date).toLocaleDateString() : "Today"}</p>
          </div>
          <div className="glass-card p-5 rounded-3xl">
            <Clock className="w-5 h-5 text-primary mb-3" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time Slot</p>
            <p className="font-bold text-sm text-foreground mt-1">{job.time || job.timeSlot || "Flexible"}</p>
          </div>
        </div>

        {/* Description */}
        <section className="glass-card p-6 rounded-[2rem]">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Service Details</p>
          <p className="text-sm font-medium leading-relaxed text-foreground/70 bg-muted/20 p-4 rounded-2xl border border-border/50">
            {job.description || `Maintenance requested for ${job.service || 'general'} systems. Please perform initial inspection and report findings.`}
          </p>
        </section>

        {/* Contact */}
        <section className="glass-card p-5 rounded-3xl flex items-center justify-between border-b-4 border-b-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center font-black text-muted-foreground">
              {(job.supervisor || "S").charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Supervisor</p>
              <p className="font-bold text-foreground">{job.supervisor || "N/A"}</p>
            </div>
          </div>
          <a
            href={`tel:${job.supervisorPhone || ''}`}
            className="w-12 h-12 rounded-2xl glass hover:bg-primary hover:text-white transition-all flex items-center justify-center text-primary active:scale-90"
          >
            <Phone className="w-5 h-5" />
          </a>
        </section>
      </main>

      {/* Action Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 glass border-t-0 z-40">
        {job.status === 'Pending' ? (
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="w-full py-4.5 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-3">
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {actionLoading ? "Processing..." : "Accept Job"}
          </button>
        ) : (job.status === 'Accepted' || isInProgress || job.status === 'Team_Confirmed' || job.status === 'Dispatched') ? (
          <button
            onClick={handleStart}
            className="w-full py-4.5 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-green-600/30 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3 animate-in slide-in-from-bottom-2">
            <PlayCircle className="w-5 h-5" />
            {isInProgress ? 'Resume Work' : 'Check In'}
          </button>
        ) : (
          <div className="w-full py-4.5 bg-muted/50 text-muted-foreground border border-border/60 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 opacity-50" />
            Job Completed
          </div>
        )}
      </footer>
    </div>
  )
}
