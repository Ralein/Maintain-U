"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { StatCard } from "@/components/cards/stat-card"
import { useEffect, useState } from "react"
import { api, Job } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function TechnicianDashboard() {
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [activeJob, setActiveJob] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getJobs()
        if (res.jobs) {
          setJobs(res.jobs)
          // Mock logic: find first pending/active job as today's assignment
          const active = res.jobs.find((j: any) => j.status === 'Pending' || j.status === 'Accepted' || j.status === 'In Progress')
          setActiveJob(active)
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error)
      }
    }
    fetchData()
  }, [])

  const stats = [
    { label: "Days Worked", value: "12", color: "from-blue-500 to-blue-600" },
    { label: "This Month", value: "₹8.5K", color: "from-green-500 to-green-600" },
    { label: "Hours", value: "96", color: "from-purple-500 to-purple-600" },
  ]

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, Raj Kumar</h1>
          <p className="text-slate-400 text-sm">Ready for today's work?</p>
        </div>
        <button className="w-10 h-10 backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
          🔔
        </button>
      </div>

      {/* Today's Assignment */}
      {activeJob ? (
        <div className="backdrop-blur-md bg-white/10 border border-l-4 border-white/20 border-l-blue-400 rounded-2xl p-5 shadow-2xl shadow-black/20 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Today's Assignment</p>
              <h3 className="text-lg font-bold text-white">{activeJob.company}</h3>
            </div>
            <span className="px-2 py-1 bg-blue-500/30 border border-blue-400/50 rounded text-xs text-blue-300 font-semibold">
              {activeJob.status}
            </span>
          </div>

          <p className="text-sm text-slate-300 mb-2">⚡ {activeJob.service}</p>
          <p className="text-sm text-slate-400 mb-4">{activeJob.time} - Location: {activeJob.location}</p>

          <div className="flex gap-3">
            <button className="flex-1 backdrop-blur-sm bg-white/5 border border-white/20 text-white font-semibold py-2 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all text-sm">
              View Details
            </button>
            <button
              onClick={() => router.push(`/technician/jobs/${activeJob.id}/active`)}
              className="flex-1 backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30 text-sm">
              Check In
            </button>
          </div>
        </div>
      ) : (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 text-center mb-8">
          <p className="text-slate-400">No active assignment for today.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Upcoming Jobs */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Upcoming Jobs</h2>
        <div className="space-y-3">
          {jobs.filter(j => j.id !== activeJob?.id).slice(0, 3).map((job) => (
            <div key={job.id} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="font-semibold text-white">{job.company}</p>
              <p className="text-xs text-slate-400">{job.date} • {job.service}</p>
            </div>
          ))}
          {jobs.length <= 1 && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 text-center py-8 text-slate-400">
              <p className="text-sm">No additional jobs scheduled</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav active="home" role="technician" />
    </div>
  )
}
