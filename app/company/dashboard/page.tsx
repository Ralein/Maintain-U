"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { TrendingUp, Clock, CheckCircle, Bell } from "lucide-react"

export default function CompanyDashboard() {
  const stats = [
    { label: "Active", value: "5", icon: TrendingUp, color: "text-blue-600" },
    { label: "In Progress", value: "12", icon: Clock, color: "text-orange-600" },
    { label: "Completed", value: "48", icon: CheckCircle, color: "text-green-600" },
  ]

  const requests = [
    {
      id: "REQ-001",
      type: "Electrical",
      company: "ABC Industries",
      date: "Today, 10:00 AM",
      status: "In Progress",
    },
    {
      id: "REQ-002",
      type: "Mechanical",
      company: "XYZ Corp",
      date: "Yesterday, 2:30 PM",
      status: "Completed",
    },
  ]

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="px-6 pt-6 pb-8 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, ABC Industries</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your maintenance requests</p>
          </div>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
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
        <h2 className="text-lg font-bold mb-4">Recent Requests</h2>
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{req.type}</p>
                  <p className="text-sm text-muted-foreground">{req.company}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    req.status === "Completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{req.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white font-bold text-xl shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
        +
      </button>

      <BottomNav active="home" role="company" />
    </div>
  )
}
