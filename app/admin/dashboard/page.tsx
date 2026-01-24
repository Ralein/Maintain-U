"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { AlertCircle, Briefcase, Users, Calendar, DollarSign, Clock, CheckCircle, Bell, UserPlus, Map, Zap, Wrench, Droplets } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    pendingTechs: 0,
    activeJobs: 0,
    completedJobs: 0,
    activeList: [] as any[]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techsRes, jobsRes] = await Promise.all([
          api.getTechnicians(),
          api.getJobs()
        ])

        const pendingTechs = techsRes.technicians.filter((t: any) => t.status === "Pending").length
        const activeJobs = jobsRes.jobs.filter((j: any) => j.status === "In Progress" || j.status === "Accepted").length
        const completedJobs = jobsRes.jobs.filter((j: any) => j.status === "Completed").length
        const activeList = jobsRes.jobs.filter((j: any) => j.status === "In Progress" || j.status === "Accepted").slice(0, 5)

        setStats({ pendingTechs, activeJobs, completedJobs, activeList })
      } catch (error) {
        console.error("Failed to fetch admin stats", error)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: "Pending", value: stats.pendingTechs.toString(), icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Completed", value: stats.completedJobs.toString(), icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  ]

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'Electrical': return <Zap className="w-5 h-5" />;
      case 'Plumbing': return <Droplets className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground font-medium">Overview & Stats</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">
        {/* Alert Banner */}
        {stats.pendingTechs > 0 && (
          <div
            onClick={() => router.push('/admin/technicians')}
            className="group relative overflow-hidden p-4 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all glass-card border-red-500/30"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-red-500/20" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm">
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Action Required</p>
                <p className="text-xs text-muted-foreground mt-0.5"><span className="font-semibold text-red-600 dark:text-red-400">{stats.pendingTechs} pending technician(s)</span> await your approval.</p>
              </div>
              <div className="flex items-center justify-center h-full my-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((stat, idx) => (
              <div key={idx} className={`glass-card p-4 rounded-2xl flex flex-col items-center text-center border ${stat.border} relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl -mr-8 -mt-8 ${stat.bg}`} />
                <div className={`relative p-2.5 rounded-full ${stat.bg} ${stat.color} mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-2xl font-bold tracking-tight relative z-10">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1 relative z-10">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Active Jobs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <button onClick={() => router.push('/admin/requests')} className="text-xs font-semibold text-primary uppercase tracking-wide hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {stats.activeList.length === 0 ? (
              <div className="glass-card p-8 rounded-xl text-center border-dashed">
                <p className="text-muted-foreground text-sm">No recent activity</p>
              </div>
            ) : (
              stats.activeList.map((job) => (
                <div key={job.id} onClick={() => router.push(`/admin/requests/${job.requestId}`)} className="glass-card p-4 rounded-xl flex items-center justify-between border-white/10 cursor-pointer hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${job.service === 'Electrical' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                      job.service === 'Mechanical' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' :
                        job.service === 'Plumbing' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                          'bg-primary/10 text-primary'
                      }`}>
                      {getServiceIcon(job.service)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{job.company}</p>
                      <p className="text-xs text-muted-foreground">{job.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${job.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                      job.status === 'In Progress' ? 'bg-orange-500/10 text-orange-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNav active="home" role="admin" />
    </div>
  )
}
