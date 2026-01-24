"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TrendingUp, Clock, CheckCircle, Bell, Loader2, Plus, Zap, Wrench, Droplets } from "lucide-react"
import { useEffect, useState } from "react"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CompanyDashboard() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    activeJobs: 0,
    completed: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getCompanyRequests()
        if (res.requests) {
          setRequests(res.requests)

          // Calculate stats using granular statuses
          const pending = res.requests.filter((r: any) =>
            ["Requested", "Reviewing", "Team_Forming", "Invites_Sent", "New", "Assigned"].includes(r.status)
          ).length

          const activeJobs = res.requests.filter((r: any) =>
            ["Team_Confirmed", "Dispatched", "On_The_Way", "Arrived", "Work_Started", "In_Progress", "In Progress", "Work_Completed", "Sign_Pending"].includes(r.status)
          ).length

          const completed = res.requests.filter((r: any) =>
            ["Completed", "Invoiced", "Paid"].includes(r.status)
          ).length

          setStats({ pending, activeJobs, completed })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    { label: "Pending", value: stats.pending.toString(), icon: TrendingUp, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-400/10", border: "border-blue-200 dark:border-blue-900" },
    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Clock, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-400/10", border: "border-orange-200 dark:border-orange-900" },
    { label: "Completed", value: stats.completed.toString(), icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-400/10", border: "border-green-200 dark:border-green-900" },
  ]

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'Electrical': return <Zap className="w-6 h-6" />;
      case 'Plumbing': return <Droplets className="w-6 h-6" />;
      default: return <Wrench className="w-6 h-6" />;
    }
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home</h1>
          <p className="text-xs text-muted-foreground font-medium">Overview & Stats</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => router.push("/company/notifications")} className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <main className="px-6 py-6 space-y-8">
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

          {/* Recent Requests */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Requests</h2>
              <button onClick={() => router.push("/company/requests")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide">View All</button>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/5">
                <p>No requests found</p>
                <button
                  onClick={() => router.push("/company/requests/new")}
                  className="mt-2 text-primary text-sm font-semibold hover:underline"
                >
                  Create your first request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    onClick={() => router.push(`/company/requests/${req.id}`)}
                    className="group glass-card p-4 rounded-xl hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${req.serviceType === 'Electrical' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                        req.serviceType === 'Mechanical' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' :
                          req.serviceType === 'Plumbing' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                            'bg-primary/10 text-primary'
                        }`}>
                        {getServiceIcon(req.serviceType)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{req.serviceType || "General Service"}</p>
                        <p className="text-xs text-muted-foreground font-mono font-medium">{req.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${req.status === "Completed"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : req.status === "In Progress"
                            ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          }`}
                      >
                        {req.status}
                      </span>
                      <p className="text-[10px] text-muted-foreground font-medium">{req.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push("/company/requests/new")}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50 ring-2 ring-white/20">
        <Plus className="w-8 h-8" />
      </button>

      <BottomNav active="home" role="company" />
    </div>
  )
}
