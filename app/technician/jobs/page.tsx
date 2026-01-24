"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Zap, Wrench, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function TechnicianJobsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"invitations" | "my-jobs" | "calendar">("invitations")


  const [invitations, setInvitations] = useState<any[]>([])
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.getJobs()
        const allJobs = res.jobs || []

        // Filter jobs
        const pending = allJobs.filter((j: any) => j.status === 'Pending')
        const accepted = allJobs.filter((j: any) =>
          j.status === 'Accepted' ||
          j.status === 'In Progress' ||
          j.status === 'In_Progress' ||
          j.status === 'Completed' ||
          j.status === 'Team_Confirmed'
        )

        setInvitations(pending)
        setMyJobs(accepted)
      } catch (error) {
        console.error("Failed to fetch jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleAccept = async (jobId: string) => {
    try {
      await api.acceptJob(jobId)
      // Refresh
      const res = await api.getJobs()
      const allJobs = res.jobs || []
      setInvitations(allJobs.filter((j: any) => j.status === 'Pending'))
      setMyJobs(allJobs.filter((j: any) => j.status === 'Accepted' || j.status === 'In Progress' || j.status === 'Completed'))
    } catch (e) {
      console.error("Failed to accept")
    }
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 mb-6 transition-all">
        <h1 className="text-2xl font-bold tracking-tight">Available Jobs</h1>
        <p className="text-xs text-muted-foreground font-medium">Accept jobs and manage your schedule</p>
      </header>

      <main className="px-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["invitations", "my-jobs", "calendar"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${activeTab === tab
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "bg-muted hover:bg-muted/80 text-muted-foreground border border-border"
                }`}
            >
              {tab === "invitations" && "Invitations"}
              {tab === "my-jobs" && "My Jobs"}
              {tab === "calendar" && "Calendar"}
            </button>
          ))}
        </div>

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{inv.company}</p>
                    <p className="text-xs text-muted-foreground">{inv.service}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">📍 {inv.location}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  ⏱️ {inv.duration} • {inv.rate}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-semibold">
                    Decline
                  </button>
                  <button onClick={() => handleAccept(inv.id)} className="flex-1 py-2 px-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors text-sm">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Jobs Tab */}
        {activeTab === "my-jobs" && (
          <div className="space-y-3">
            {myJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/technician/jobs/${job.id}`)}
                className="p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-semibold">{job.company}</p>
                      <p className="text-xs text-muted-foreground">{job.id}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Scheduled: {job.date || "Today"}</p>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${job.status === 'In_Progress' || job.status === 'In Progress'
                    ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                    : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    }`}>
                    {job.status}
                  </span>

                  {(job.status === 'Accepted' || job.status === 'Team_Confirmed') ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/technician/jobs/${job.id}`); // Navigate to details to perform check-in
                      }}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      Check In
                    </button>
                  ) : (
                    <button className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
                      View Details <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">January 2026</h2>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-muted rounded-full transition-colors"><ArrowRight className="w-4 h-4 rotate-180" /></button>
                <button className="p-1 hover:bg-muted rounded-full transition-colors"><ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 4
                const hasJob = day === 15 || day === 16 || day === 22
                // Highlight today (e.g., 24th)
                const isToday = day === 24

                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer relative group
                      ${day < 1 || day > 31
                        ? "opacity-0 pointer-events-none"
                        : isToday
                          ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                          : hasJob
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "hover:bg-muted text-foreground"
                      }`}
                  >
                    {day > 0 && day <= 31 ? day : ""}
                    {hasJob && !isToday && (
                      <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-500" />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Scheduled Job</span>
              </div>
            </div>
          </div>
        )}

      </main>
      <BottomNav active="jobs" role="technician" />
    </div>
  )
}
