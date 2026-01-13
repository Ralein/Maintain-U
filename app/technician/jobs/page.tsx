"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Zap, Wrench } from "lucide-react"

export default function TechnicianJobsPage() {
  const [activeTab, setActiveTab] = useState<"invitations" | "my-jobs" | "calendar">("invitations")

  const invitations = [
    {
      id: "INV-001",
      company: "ABC Industries",
      location: "Industrial Area, Block A",
      service: "Electrical Maintenance",
      duration: "4 hours",
      rate: "₹800",
      icon: Zap,
    },
    {
      id: "INV-002",
      company: "XYZ Corp",
      location: "Downtown Complex",
      service: "Mechanical Repair",
      duration: "6 hours",
      rate: "₹1200",
      icon: Wrench,
    },
  ]

  const myJobs = [
    {
      id: "JOB-001",
      company: "ABC Industries",
      date: "Jan 15, 2025",
      status: "Scheduled",
      icon: Zap,
    },
    {
      id: "JOB-002",
      company: "Tech Solutions",
      date: "Jan 16, 2025",
      status: "Scheduled",
      icon: Wrench,
    },
  ]

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Available Jobs</h1>
        <p className="text-muted-foreground text-sm">Accept jobs and manage your schedule</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["invitations", "my-jobs", "calendar"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "bg-muted hover:bg-muted/80 text-muted-foreground border border-border"
            }`}
          >
            {tab === "invitations" && "Invitations"}
            {tab === "my-jobs" && "My Jobs"}
            {tab === "calendar" && "Calendar"}
          </button>
        ))}
      </div>

      {/* Invitations Tab */}
      {activeTab === "invitations" && (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <inv.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{inv.company}</p>
                  <p className="text-xs text-muted-foreground">{inv.service}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">📍 {inv.location}</p>
              <p className="text-sm text-muted-foreground mb-4">
                ⏱️ {inv.duration} • {inv.rate}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-semibold">
                  Decline
                </button>
                <button className="flex-1 py-2 px-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors text-sm">
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Jobs Tab */}
      {activeTab === "my-jobs" && (
        <div className="space-y-3">
          {myJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold">{job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.id}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{job.date}</p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded">
                  {job.status}
                </span>
                <button className="text-primary hover:text-primary/80 text-sm font-semibold">View →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 4
              const hasJob = day === 15 || day === 16 || day === 22
              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    day < 1 || day > 31
                      ? ""
                      : hasJob
                        ? "bg-primary/20 text-primary border border-primary/50"
                        : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {day > 0 && day <= 31 ? day : ""}
                </div>
              )
            })}
          </div>
          <p className="text-sm text-muted-foreground text-center">Blue dates have scheduled jobs</p>
        </div>
      )}

      <BottomNav active="jobs" role="technician" />
    </div>
  )
}
