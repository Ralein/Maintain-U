"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { TrendingUp, Clock, CheckCircle, Bell, Loader2 } from "lucide-react"
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
    { label: "Active", value: stats.active.toString(), icon: TrendingUp, color: "text-blue-600" },
    { label: "In Progress", value: stats.inProgress.toString(), icon: Clock, color: "text-orange-600" },
    { label: "Completed", value: stats.completed.toString(), icon: CheckCircle, color: "text-green-600" },
  ]

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="px-6 pt-6 pb-8 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, Partner</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your maintenance requests</p>
          </div>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-3 gap-3">
              {statCards.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-card border border-border">
                  <div className={`${stat.color} mb-3`}>
                    <stat.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Requests</h2>
              <button onClick={() => router.push("/company/requests")} className="text-sm text-primary font-medium hover:underline">View All</button>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                No requests found
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    onClick={() => router.push(`/company/requests/${req.id}`)}
                    className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{req.type}</p>
                        <p className="text-sm text-muted-foreground">{req.id}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${req.status === "Completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : req.status === "In Progress"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push("/company/requests/new")}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white font-bold text-xl shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center z-50">
        +
      </button>

      <BottomNav active="home" role="company" />
    </div>
  )
}
