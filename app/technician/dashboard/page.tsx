"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { StatCard } from "@/components/cards/stat-card"
import { useEffect, useState } from "react"
import { api, Job } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Bell, Zap, MapPin, Calendar, ArrowRight } from "lucide-react"

export default function TechnicianDashboard() {
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [activeJob, setActiveJob] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getJobs()
        if (res.jobs) {
          setJobs(res.jobs)
          // Mock logic: find first pending/active job as today's assignment
          const active = res.jobs.find((j: any) => j.status === 'Pending' || j.status === 'Accepted' || j.status === 'In Progress')
          setActiveJob(active)
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error)
      }
    }
    fetchData()
  }, [])

  const completedCount = jobs.filter(j => j.status === 'Completed').length
  const pendingCount = jobs.filter(j => j.status === 'Pending').length
  const activeCount = jobs.filter(j => j.status === 'In Progress').length

  const stats = [
    { label: "Jobs Completed", value: completedCount.toString(), color: "from-green-500 to-green-600" },
    { label: "Pending", value: pendingCount.toString(), color: "from-orange-500 to-orange-600" },
    { label: "Active", value: activeCount.toString(), color: "from-blue-500 to-blue-600" },
  ]

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between mb-8 transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, Raj Kumar</h1>
          <p className="text-muted-foreground text-sm">Ready for today's work?</p>
        </div>
        <button onClick={() => router.push("/technician/notifications")} className="p-2.5 hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 bg-white/50 dark:bg-black/20">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <main className="px-6 space-y-8">
        {/* Today's Assignment */}
        {activeJob ? (
          <div className="glass-card p-5 rounded-3xl relative overflow-hidden group border-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />

            <div className="flex items-start justify-between mb-4 relative">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Today's Assignment</p>
                <h3 className="text-xl font-bold">{activeJob.company}</h3>
              </div>
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {activeJob.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
              <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="font-medium">{activeJob.service}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{activeJob.time} - {activeJob.location}</span>
            </div>

            <div className="flex gap-3 relative">
              <button
                onClick={() => router.push(`/technician/jobs/${activeJob.id}`)}
                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-sm transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => router.push(`/technician/jobs/${activeJob.id}/active`)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm"
              >
                Check In
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl text-center mb-8 border-dashed">
            <p className="text-muted-foreground">No active assignment for today.</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Upcoming Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Upcoming Jobs</h2>
            <button className="text-xs font-semibold text-primary uppercase tracking-wide">View All</button>
          </div>
          <div className="space-y-3">
            {jobs.filter(j => j.id !== activeJob?.id).slice(0, 3).map((job) => (
              <div key={job.id} className="glass-card p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Calendar className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.date} • {job.service}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
            {jobs.length <= 1 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No additional jobs scheduled</p>
              </div>
            )}
          </div>
        </div>

      </main>

      <BottomNav active="home" role="technician" />
    </div>
  )
}
