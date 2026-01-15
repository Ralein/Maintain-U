"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Loader2, Bell } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function AdminRequestsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"new" | "assigned" | "in-progress" | "completed">("new")
  const [requests, setRequests] = useState<{ [key: string]: Request[] }>({
    new: [],
    assigned: [],
    "in-progress": [],
    completed: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getRequests()
        if (res.requests) {
          const newRequests = res.requests.filter((r: any) => r.status === "New")
          const assignedRequests = res.requests.filter((r: any) => r.status === "Assigned")
          const inProgressRequests = res.requests.filter((r: any) => r.status === "In Progress")
          const completedRequests = res.requests.filter((r: any) => r.status === "Completed")

          setRequests({
            new: newRequests,
            assigned: assignedRequests,
            "in-progress": inProgressRequests,
            completed: completedRequests
          })
        }
      } catch (error) {
        console.error("Failed to fetch requests", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const tabs: Array<"new" | "assigned" | "in-progress" | "completed"> = ["new", "assigned", "in-progress", "completed"]

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage Maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all relative border ${activeTab === tab
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-card text-muted-foreground border-border/50 hover:bg-muted hover:border-border"
                }`}
            >
              {tab === "new" && "New"}
              {tab === "assigned" && "Assigned"}
              {tab === "in-progress" && "In Progress"}
              {tab === "completed" && "Completed"}
              {requests[tab].length > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab
                  ? "bg-primary-foreground/20 text-white"
                  : "bg-muted-foreground/10 text-muted-foreground"
                  }`}>
                  {requests[tab].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Requests List */
          <div className="space-y-3">
            {requests[activeTab].length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/5">
                No {activeTab.replace('-', ' ')} requests
              </div>
            ) : (
              requests[activeTab].map((req: any) => (
                <div
                  key={req.id}
                  onClick={() => router.push(`/admin/requests/${req.id}`)}
                  className="glass-card p-5 rounded-2xl group cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors text-lg">{req.companyName || req.companyId}</p>
                      <p className="text-xs text-muted-foreground font-mono">{req.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider ${req.priority === "Emergency"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : req.priority === "Urgent"
                            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                          }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="font-medium text-foreground">{req.type}</span>
                    <span>•</span>
                    <span>{req.date}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <button className="flex-1 py-2.5 rounded-xl border border-border bg-muted/50 text-sm font-semibold hover:bg-muted transition-colors">
                      View Details
                    </button>
                    {activeTab === "new" && (
                      <button className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        Assign Team
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav active="jobs" role="admin" />
    </div>
  )
}
