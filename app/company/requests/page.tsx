"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { BiSearch, BiFilter } from "react-icons/bi"

export default function CompanyRequestsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all")

  const requests = [
    {
      id: "REQ-001",
      type: "Electrical",
      date: "Jan 12, 2025",
      status: "In Progress",
      priority: "Normal",
    },
    {
      id: "REQ-002",
      type: "Mechanical",
      date: "Jan 11, 2025",
      status: "Completed",
      priority: "Urgent",
    },
    {
      id: "REQ-003",
      type: "HVAC",
      date: "Jan 10, 2025",
      status: "Active",
      priority: "Normal",
    },
    {
      id: "REQ-004",
      type: "Assembly",
      date: "Jan 09, 2025",
      status: "Completed",
      priority: "Normal",
    },
  ]

  const statusColors: Record<string, string> = {
    "In Progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Active: "bg-green-500/10 text-green-600 border-green-500/20",
    Completed: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  }

  const priorityColors: Record<string, string> = {
    Normal: "text-muted-foreground",
    Urgent: "text-orange-600 dark:text-orange-400 font-bold",
    Emergency: "text-red-600 dark:text-red-400 font-bold",
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-5 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage maintenance</p>
        </div>
        <button className="p-2.5 hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95">
          <BiFilter className="w-6 h-6" />
        </button>
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
        <div className="space-y-3">
          {requests
            .filter((req) => {
              if (activeTab === "completed") return req.status === "Completed"
              if (activeTab === "active") return req.status !== "Completed"
              return true
            })
            .map((req) => (
              <div
                key={req.id}
                className="glass-card p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${req.type === 'Electrical' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                      req.type === 'Mechanical' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' :
                        req.type === 'HVAC' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                          'bg-primary/10 text-primary'
                    }`}>
                    <span className="font-bold text-lg">{req.type.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{req.type}</p>
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
      </main>

      <BottomNav active="requests" role="company" />
    </div>
  )
}
