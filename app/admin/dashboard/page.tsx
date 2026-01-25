"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { AlertCircle, Briefcase, Users, Calendar, DollarSign, Clock, CheckCircle, Bell, UserPlus, Map as MapIcon, Zap, Wrench, Droplets, ChevronRight, Eye, MoreVertical, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeJobs: 0,
    completedJobs: 0,
    systemActivity: [] as any[],
    pendingTechs: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techsRes, jobsRes, reqsRes] = await Promise.all([
          api.getTechnicians(),
          api.getJobs(),
          api.getRequests()
        ])

        const pendingTechsCount = techsRes.technicians.filter((t: any) => t.status === "Pending").length

        // Pending = Requests that are NOT yet fully assigned/confirmed
        const pendingRequests = reqsRes.requests.filter((r: any) =>
          ["Requested", "Reviewing", "Team_Forming", "Invites_Sent", "New"].includes(r.status)
        ).length

        const activeJobs = jobsRes.jobs.filter((j: any) =>
          ["In Progress", "In_Progress", "Accepted", "Team_Confirmed", "Dispatched", "On_The_Way", "Arrived", "Work_Started"].includes(j.status)
        ).length

        const completedJobs = jobsRes.jobs.filter((j: any) =>
          ["Completed", "Work_Completed", "Sign_Pending"].includes(j.status)
        ).length

        // Create a unified System Activity feed (Deduplicated)
        const activityMap = new Map<string, any>();

        // Add requests first
        reqsRes.requests.forEach((r: any) => {
          activityMap.set(r.id, {
            id: r.id,
            type: 'request',
            title: r.companyName,
            subtitle: r.serviceType,
            status: r.status,
            createdAt: r.createdAt,
            requestId: r.id
          });
        });

        // Overlay with jobs (jobs take precedence as they are more 'current')
        jobsRes.jobs.forEach((j: any) => {
          activityMap.set(j.requestId, {
            id: j.id,
            type: 'job',
            title: j.company,
            subtitle: j.service,
            status: j.status,
            createdAt: j.createdAt,
            requestId: j.requestId
          });
        });

        const activityFeed = Array.from(activityMap.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)

        setStats({ pendingRequests, activeJobs, completedJobs, systemActivity: activityFeed, pendingTechs: pendingTechsCount })
      } catch (error) {
        console.error("Failed to fetch admin stats", error)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: "Pending", value: stats.pendingRequests.toString(), icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", path: "/admin/requests?tab=new" },
    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", path: "/admin/requests?tab=in-progress" },
    { label: "Completed", value: stats.completedJobs.toString(), icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", path: "/admin/requests?tab=completed" },
  ]

  const quickActions = [
    { label: "Add Tech", desc: "Manage workforce", icon: UserPlus, path: "/admin/technicians", color: "text-primary", bg: "bg-primary/10" },
    { label: "Attendance", desc: "Daily work logs", icon: Calendar, path: "/admin/daily-select", color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Payroll", desc: "Finances & salary", icon: DollarSign, path: "/admin/salary", color: "text-green-600", bg: "bg-green-600/10" },
    { label: "Feedbacks", desc: "Client reviews", icon: Star, path: "/admin/feedback", color: "text-yellow-500", bg: "bg-yellow-500/10" },
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
              <div
                key={idx}
                onClick={() => router.push(stat.path)}
                className={`glass-card p-4 rounded-2xl flex flex-col items-center text-center border ${stat.border} relative overflow-hidden cursor-pointer hover:scale-105 hover:bg-muted/30 transition-all`}
              >
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

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-xl font-bold tracking-tight">Management Suite</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => router.push(action.path)}
                className="glass-card p-5 flex items-center gap-4 hover:border-primary/50 hover:bg-muted/30 transition-all group relative overflow-hidden text-left active:scale-95 shadow-xl shadow-black/5"
              >
                <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </section>

        {/* System Activity */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-xl font-bold tracking-tight">System Activity</h2>
            <button onClick={() => router.push('/admin/requests')} className="text-xs font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
              Live Feed <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </button>
          </div>
          <div className="space-y-4">
            {stats.systemActivity.length === 0 ? (
              <div className="glass-card p-12 rounded-[2.5rem] text-center border-dashed border-2 flex flex-col items-center gap-3">
                <div className="p-4 bg-muted/50 rounded-full text-muted-foreground/30">
                  <Briefcase className="w-10 h-10" />
                </div>
                <p className="text-muted-foreground font-bold text-sm">Quiet Day... No Activity</p>
              </div>
            ) : (
              stats.systemActivity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => router.push(`/admin/requests/${item.requestId}`)}
                  className="glass-card p-5 rounded-[2rem] flex items-center justify-between border-white/5 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all group relative overflow-hidden active:scale-[0.99] shadow-lg shadow-black/5"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${item.subtitle === 'Electrical' ? 'bg-yellow-500/10 text-yellow-600' :
                      item.subtitle === 'Mechanical' ? 'bg-slate-500/10 text-slate-600' :
                        item.subtitle === 'Plumbing' ? 'bg-cyan-500/10 text-cyan-600' :
                          'bg-primary/10 text-primary'
                      }`}>
                      {getServiceIcon(item.subtitle)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-foreground text-base tracking-tight leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                        {item.type === 'request' && (
                          <span className="bg-red-500/10 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">URGENT</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="text-right hidden sm:block">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${item.status === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        item.status === 'In Progress' || item.status === 'In_Progress' || item.status === 'Requested' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse' :
                          'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background/50 border border-border/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all shadow-sm">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Subtle Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
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
