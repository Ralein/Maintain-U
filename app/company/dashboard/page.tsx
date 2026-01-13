"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { BiTrendingUp, BiTime, BiCheckCircle, BiBell, BiLoaderAlt, BiPlus } from "react-icons/bi"
import { useEffect, useState } from "react"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CompanyDashboard() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    active: 0,
    inProgress: 0,
    completed: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getCompanyRequests()
        if (res.requests) {
          setRequests(res.requests)

          // Calculate stats
          const active = res.requests.filter((r: any) => r.status === "New" || r.status === "Assigned").length
          const inProgress = res.requests.filter((r: any) => r.status === "In Progress").length
          const completed = res.requests.filter((r: any) => r.status === "Completed").length

          setStats({ active, inProgress, completed })
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
    { label: "Active", value: stats.active.toString(), icon: BiTrendingUp, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-400/10" },
    { label: "In Progress", value: stats.inProgress.toString(), icon: BiTime, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-400/10" },
    { label: "Completed", value: stats.completed.toString(), icon: BiCheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-400/10" },
  ]

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-5 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home</h1>
          <p className="text-xs text-muted-foreground font-medium">Overview & Stats</p>
        </div>
        <button onClick={() => router.push("/company/notifications")} className="p-2.5 hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95">
          <BiBell className="w-6 h-6" />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <BiLoaderAlt className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <main className="px-6 py-6 space-y-8">
          {/* Stats Grid */}
          <section>
            <div className="grid grid-cols-3 gap-3">
              {statCards.map((stat, idx) => (
                <div key={idx} className="glass-card p-4 rounded-2xl flex flex-col items-center text-center">
                  <div className={`p-2.5 rounded-full ${stat.bg} ${stat.color} mb-3`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">{stat.label}</p>
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
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${req.type === 'Electrical' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                          req.type === 'Mechanical' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' :
                            req.type === 'Plumbing' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                              'bg-primary/10 text-primary'
                        }`}>
                        <span className="font-bold text-lg">{req.type.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{req.type}</p>
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
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50">
        <BiPlus className="w-8 h-8" />
      </button>

      <BottomNav active="home" role="company" />
    </div>
  )
}
