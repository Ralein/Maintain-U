"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { CheckCircle2 } from "lucide-react"

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const timeline = [
    { step: "Submitted", date: "Jan 12, 2025", status: "completed" },
    { step: "Reviewed", date: "Jan 12, 2025", status: "completed" },
    { step: "Team Assigned", date: "Pending", status: "pending" },
    { step: "Work Started", date: "Pending", status: "pending" },
    { step: "Completed", date: "Pending", status: "pending" },
  ]

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{params.id}</h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-semibold">
            In Progress
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Progress</h2>
        <div className="space-y-4">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    item.status === "completed" ? "bg-green-500 border-green-400" : "bg-muted border-border"
                  }`}
                >
                  {item.status === "completed" && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />}
                </div>
                {idx < timeline.length - 1 && (
                  <div className={`w-0.5 h-12 ${item.status === "completed" ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
              <div className="pb-4">
                <p className="font-semibold">{item.step}</p>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Details */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Details</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Service Type</p>
            <p className="font-semibold">Electrical Maintenance</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Priority</p>
            <p className="font-semibold">Normal</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p>Main switchboard needs inspection and replacement of damaged circuit breaker</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Scheduled Date</p>
            <p className="font-semibold">Jan 15, 2025 - Morning</p>
          </div>
        </div>
      </div>

      <BottomNav active="requests" role="company" />
    </div>
  )
}
