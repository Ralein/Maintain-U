"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { AlertCircle, Briefcase, Users, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    pendingTechs: 0,
    activeJobs: 0,
    completedJobs: 0,
    activeList: [] as any[]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techsRes, jobsRes] = await Promise.all([
          api.getTechnicians(),
          api.getJobs()
        ])

        const pendingTechs = techsRes.technicians.filter((t: any) => t.status === "Pending").length
        const activeJobs = jobsRes.jobs.filter((j: any) => j.status === "In Progress" || j.status === "Accepted").length
        const completedJobs = jobsRes.jobs.filter((j: any) => j.status === "Completed").length
        const activeList = jobsRes.jobs.filter((j: any) => j.status === "In Progress" || j.status === "Accepted").slice(0, 5)

        setStats({ pendingTechs, activeJobs, completedJobs, activeList })
      } catch (error) {
        console.error("Failed to fetch admin stats")
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: "Pending Approvals", value: stats.pendingTechs.toString(), icon: AlertCircle, color: "text-red-500" },
    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Clock, color: "text-blue-500" },
    { label: "Completed", value: stats.completedJobs.toString(), icon: CheckCircle, color: "text-green-500" },
  ]

  const quickActions = [
    { icon: Briefcase, label: "View Requests", path: "/admin/requests" },
    { icon: Users, label: "Technicians", path: "/admin/technicians" }, // Assuming this route exists or will exist
    { icon: Calendar, label: "Daily Select", path: "/admin/daily-select" },
    { icon: DollarSign, label: "Salary", path: "/admin/salary" },
  ]

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Alert Banner */}
      {stats.pendingTechs > 0 && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-l-4 border-red-200 dark:border-red-900 border-l-red-600 dark:border-l-red-500 mb-6 cursor-pointer" onClick={() => router.push('/admin/technicians')}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{stats.pendingTechs} pending technician approvals</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => action.path && router.push(action.path)}
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
          {stats.activeList.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-lg">No active jobs</p>
          ) : (
            stats.activeList.map((job) => (
              <div key={job.id} className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.service}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold rounded">
                    {job.status}
                  </span>
                </div>
                {/* <p className="text-sm text-muted-foreground">2 technicians assigned</p> */}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav active="home" role="admin" />
    </div>
  )
}
