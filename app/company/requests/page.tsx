"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BiSearch, BiFilter, BiPlus, BiLoaderAlt } from "react-icons/bi"
import { Zap, Wrench, Thermometer, Settings, Droplet } from "lucide-react"
import { api, Request } from "@/lib/api"
import { toast } from "sonner"

export default function CompanyRequestsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all")
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.getCompanyRequests()
        if (res.requests) {
          setRequests(res.requests as unknown as Request[])
        }
      } catch (error) {
        toast.error("Failed to load requests")
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const statusColors: Record<string, string> = {
    "Requested": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Reviewing": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Team_Forming": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Invites_Sent": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    "Team_Confirmed": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    "Dispatched": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    "On_The_Way": "bg-teal-500/10 text-teal-600 border-teal-500/20",
    "Arrived": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Work_Started": "bg-green-500/10 text-green-600 border-green-500/20",
    "In_Progress": "bg-blue-600/10 text-blue-700 border-blue-600/20",
    "Work_Completed": "bg-green-600/10 text-green-700 border-green-600/20",
    "Sign_Pending": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Completed": "bg-slate-500/10 text-slate-600 border-slate-500/20",
    "Invoiced": "bg-pink-500/10 text-pink-600 border-pink-500/20",
    "Paid": "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
    "Cancelled": "bg-red-500/10 text-red-600 border-red-500/20",
  }

  const priorityColors: Record<string, string> = {
    Normal: "text-muted-foreground",
    Urgent: "text-orange-600 dark:text-orange-400 font-bold",
    Emergency: "text-red-600 dark:text-red-400 font-bold",
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "Electrical": return <Zap className="w-6 h-6" />
      case "Mechanical": return <Settings className="w-6 h-6" />
      case "HVAC": return <Thermometer className="w-6 h-6" />
      case "Plumbing": return <Droplet className="w-6 h-6" />
      case "Assembly": return <Wrench className="w-6 h-6" />
      default: return <Wrench className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm">
            <BiFilter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BiSearch className="text-muted-foreground w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by ID or Type..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(["all", "active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all border ${activeTab === tab
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-transparent hover:bg-muted text-muted-foreground border-border"
                }`}
            >
              {tab === "all" && "All Requests"}
              {tab === "active" && "Active"}
              {tab === "completed" && "Completed"}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <BiLoaderAlt className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <p>No requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests
              .filter((req) => {
                if (activeTab === "completed") return req.status === "Completed"
                if (activeTab === "active") return req.status !== "Completed" && req.status !== "Cancelled"
                return true
              })
              .map((req) => (
                <div
                  key={req.id}
                  onClick={() => router.push(`/company/requests/${req.id}`)}
                  className="glass-card p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${req.serviceType === 'Electrical' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                      req.serviceType === 'Mechanical' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' :
                        req.serviceType === 'HVAC' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                          'bg-primary/10 text-primary'
                      }`}>
                      {getIcon(req.serviceType)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{req.serviceType}</p>
                      <p className="text-xs text-muted-foreground font-mono font-medium">{req.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[req.status] || 'bg-slate-100 text-slate-600'}`}>
                      {req.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${priorityColors[req.priority]}`}>{req.priority}</span>
                      <span className="text-[10px] text-muted-foreground">• {req.date}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => router.push("/company/requests/new")}
        className="fixed bottom-24 right-5 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50">
        <BiPlus className="w-6 h-6" />
      </button>

      <BottomNav active="requests" role="company" />
    </div>
  )
}
