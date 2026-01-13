"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

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
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-6">Maintenance Requests</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all relative ${activeTab === tab
                ? "backdrop-blur-md bg-blue-500/30 border border-blue-400/50 text-blue-300"
                : "backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 text-slate-400"
              }`}
          >
            {tab === "new" && "New"}
            {tab === "assigned" && "Assigned"}
            {tab === "in-progress" && "In Progress"}
            {tab === "completed" && "Completed"}
            {requests[tab].length > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white ${tab === 'new' ? 'bg-red-500' : 'bg-slate-600'
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
            <div className="text-center py-10 text-slate-400 border border-dashed border-white/10 rounded-lg">
              No {activeTab.replace('-', ' ')} requests
            </div>
          ) : (
            requests[activeTab].map((req: any) => (
              <div
                key={req.id}
                onClick={() => router.push(`/admin/requests/${req.id}`)}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 group cursor-pointer hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{req.companyName || req.companyId}</p>
                    <p className="text-xs text-slate-400">{req.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${req.priority === "Emergency"
                          ? "bg-red-500/30 text-red-300"
                          : req.priority === "Urgent"
                            ? "bg-yellow-500/30 text-yellow-300"
                            : "bg-slate-500/30 text-slate-300"
                        }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  {req.type} • {req.date}
                </p>
                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <button className="flex-1 backdrop-blur-sm bg-white/5 border border-white/20 text-white font-semibold py-2 text-xs rounded-xl hover:bg-white/10 hover:border-white/30 transition-all">
                    View
                  </button>
                  {activeTab === "new" && (
                    <button className="flex-1 backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2 text-xs rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30">
                      Assign
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <BottomNav active="jobs" role="admin" />
    </div>
  )
}
