"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Search } from "lucide-react"

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
    "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Completed: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  }

  const priorityColors: Record<string, string> = {
    Normal: "text-muted-foreground",
    Urgent: "text-orange-600 dark:text-orange-400 font-semibold",
    Emergency: "text-red-600 dark:text-red-400 font-semibold",
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Your Requests</h1>
        <p className="text-muted-foreground text-sm">Track and manage all maintenance requests</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search requests..."
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button className="p-3 rounded-lg border border-border hover:bg-muted transition-colors">
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["all", "active", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "bg-muted hover:bg-muted/80 text-muted-foreground border border-border"
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
              className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{req.type}</p>
                  <p className="text-xs text-muted-foreground">{req.id}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[req.status]}`}>
                  {req.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">{req.date}</p>
                <p className={`text-xs font-medium ${priorityColors[req.priority]}`}>{req.priority}</p>
              </div>
            </div>
          ))}
      </div>

      <BottomNav active="requests" role="company" />
    </div>
  )
}
