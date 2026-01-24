"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { AlertCircle, Briefcase, Users, Calendar, DollarSign, Clock, CheckCircle, Bell, UserPlus, Map } from "lucide-react"
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
    { label: "Pending Approvals", value: stats.pendingTechs.toString(), icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: stats.completedJobs.toString(), icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  ]



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
            className="group relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 border border-red-200 dark:border-red-900 cursor-pointer shadow-sm hover:shadow-md transition-all"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl -mr-8 -mt-8" />
            <div className="flex items-start gap-4 relative">
              <div className="p-2 rounded-lg bg-white/80 dark:bg-red-900/20 shadow-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-red-900 dark:text-red-200">Action Required</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{stats.pendingTechs} pending technician approvals</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((stat, idx) => (
              <div key={idx} className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className={`p-2.5 rounded-full ${stat.bg} ${stat.color} mb-2`}>
                  <stat.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{stat.label}</p>
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
                  <div>
                    <p className="font-semibold text-foreground">{job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.service}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${job.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                      job.status === 'In Progress' ? 'bg-orange-500/10 text-orange-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>
                      {job.status}
                    </span>
                    <button className="text-xs font-semibold text-primary hover:text-primary/80">View</button>
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
