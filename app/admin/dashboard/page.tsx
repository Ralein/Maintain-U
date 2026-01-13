"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { AlertCircle, Briefcase, Users, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { label: "Pending", value: "3", icon: AlertCircle, color: "text-warning" },
    { label: "Active Jobs", value: "24", icon: Clock, color: "text-primary" },
    { label: "Completed", value: "156", icon: CheckCircle, color: "text-success" },
  ]

  const quickActions = [
    { icon: Briefcase, label: "View Requests" },
    { icon: Users, label: "Assign Team" },
    { icon: Calendar, label: "Daily Select" },
    { icon: DollarSign, label: "Salary" },
  ]

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Alert Banner */}
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-l-4 border-red-200 dark:border-red-900 border-l-red-600 dark:border-l-red-500 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">3 pending technician approvals</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <action.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Jobs */}
      <div>
        <h2 className="text-lg font-bold mb-4">Active Jobs (Today)</h2>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Company {i}</p>
                  <p className="text-xs text-muted-foreground">Service Type</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold rounded">
                  In Progress
                </span>
              </div>
              <p className="text-sm text-muted-foreground">2 technicians assigned</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" role="admin" />
    </div>
  )
}
