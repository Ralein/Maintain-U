"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { useEffect, useState } from "react"
import { api, Job } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Bell, Zap, MapPin, Calendar, ArrowRight, CheckCircle, Clock, AlertCircle, Wrench, Droplets } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { getTechnicianProfileAction } from "@/lib/actions"

export default function TechnicianDashboard() {
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [activeJob, setActiveJob] = useState<any>(null)
  const [techName, setTechName] = useState("Technician")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, profileRes] = await Promise.all([
          api.getJobs(),
          getTechnicianProfileAction()
        ])

        if (profileRes.success && profileRes.data?.name) {
          setTechName(profileRes.data.name.split(' ')[0])
        }

        if (res.jobs) {
          setJobs(res.jobs)
          // Find prioritized active job
          const active = res.jobs.find((j: any) => j.status === 'In Progress' || j.status === 'In_Progress') ||
            res.jobs.find((j: any) => j.status === 'Accepted' || j.status === 'Team_Confirmed')
          setActiveJob(active)
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error)
      }
    }
    fetchData()
  }, [])

  const completedCount = jobs.filter(j => j.status === 'Completed').length
  const pendingCount = jobs.filter(j => j.status === 'Pending').length // Invitations
  const activeCount = jobs.filter(j => j.status === 'In Progress' || j.status === 'In_Progress' || j.status === 'Accepted' || j.status === 'Team_Confirmed').length

  const stats = [
    { label: "Completed", value: completedCount.toString(), icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-400/10", border: "border-green-200 dark:border-green-900" },
    { label: "Invitations", value: pendingCount.toString(), icon: AlertCircle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-400/10", border: "border-orange-200 dark:border-orange-900" },
    { label: "Active Jobs", value: activeCount.toString(), icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-400/10", border: "border-blue-200 dark:border-blue-900" },
  ]

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'Electrical': return <Zap className="w-4 h-4" />;
      case 'Plumbing': return <Droplets className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between mb-2 transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {techName}</h1>
          <p className="text-muted-foreground text-xs font-medium">Ready for today's work?</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => router.push("/technician/notifications")} className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Today's Assignment */}
        {activeJob ? (
          <div className="glass-card p-5 rounded-3xl relative overflow-hidden group border-primary/20 shadow-lg shadow-primary/5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-110" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] text-primary uppercase tracking-wider font-bold">Today's Focus</p>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{activeJob.company}</h3>
                </div>
                <span className="px-2.5 py-1 bg-background/50 backdrop-blur-md border border-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {activeJob.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-foreground/80 mb-2 font-medium">
                <div className={`p-1 rounded-md ${activeJob.service === 'Electrical' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-primary/20 text-primary'}`}>
                  {getServiceIcon(activeJob.service)}
                </div>
                <span>{activeJob.service}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{activeJob.time || "09:00 AM"} - {activeJob.location || "On Site"}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/technician/jobs/${activeJob.id}`)}
                  className="flex-1 py-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 font-semibold text-sm transition-all backdrop-blur-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => router.push(`/technician/jobs/${activeJob.id}/active`)}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm active:scale-95"
                >
                  Check In
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl text-center mb-8 border-dashed flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No active assignment for today.</p>
            <p className="text-xs text-muted-foreground/70">Enjoy your day off!</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className={`glass-card p-3 rounded-2xl flex flex-col items-center text-center border ${stat.border} relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 w-12 h-12 rounded-full blur-xl -mr-6 -mt-6 ${stat.bg} group-hover:scale-150 transition-transform duration-500`} />
              <div className={`relative p-2 rounded-full ${stat.bg} ${stat.color} mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold tracking-tight relative z-10">{stat.value}</p>
              <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5 relative z-10 truncate w-full">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Upcoming Jobs</h2>
            <button className="text-xs font-semibold text-primary uppercase tracking-wide hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {jobs.filter(j => j.id !== activeJob?.id && j.status !== 'Completed').slice(0, 3).map((job) => (
              <div key={job.id} onClick={() => router.push(`/technician/jobs/${job.id}`)} className="glass-card p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all border-transparent">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${job.service === 'Electrical' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-primary/10 text-primary'}`}>
                    {getServiceIcon(job.service)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{job.company}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {job.date}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
            {jobs.filter(j => j.id !== activeJob?.id && j.status !== 'Completed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground bg-muted/5 rounded-2xl border border-dashed">
                <p className="text-sm">No upcoming jobs scheduled</p>
              </div>
            )}
          </div>
        </div>

      </main>

      <BottomNav active="home" role="technician" />
    </div>
  )
}
