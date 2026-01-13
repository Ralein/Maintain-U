"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getRequestById(params.id)
        if (res.request) {
          setRequest(res.request)
        }
      } catch (error) {
        console.error("Failed to fetch request", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Request not found</p>
        <button onClick={() => router.back()} className="text-primary hover:underline">Go Back</button>
      </div>
    )
  }

  const timeline = [
    { step: "Submitted", date: request.date, status: "completed" },
    { step: "Reviewed", date: request.status !== "New" ? "Completed" : "Pending", status: request.status !== "New" ? "completed" : "pending" },
    { step: "Team Assigned", date: request.status === "Assigned" || request.status === "In Progress" || request.status === "Completed" ? "Completed" : "Pending", status: request.status === "Assigned" || request.status === "In Progress" || request.status === "Completed" ? "completed" : "pending" },
    { step: "Work Started", date: request.status === "In Progress" || request.status === "Completed" ? "Started" : "Pending", status: request.status === "In Progress" || request.status === "Completed" ? "completed" : "pending" },
    { step: "Completed", date: request.status === "Completed" ? "Done" : "Pending", status: request.status === "Completed" ? "completed" : "pending" },
  ]

  return (
    <div className="min-h-screen px-6 pt-6 pb-32">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="mb-4 p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{request.id}</h1>
        </div>
        <div className="mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${request.status === 'Completed' ? 'bg-green-100 text-green-700' :
            request.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
            {request.status}
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
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.status === "completed" ? "bg-green-500 border-green-400" : "bg-muted border-border"
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
            <p className="font-semibold">{request.type}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Priority</p>
            <p className="font-semibold">{request.priority}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p>{request.description}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Scheduled Date</p>
            <p className="font-semibold">{request.date} {request.timeSlot && `- ${request.timeSlot}`}</p>
          </div>
        </div>
      </div>

      <BottomNav active="requests" role="company" />
    </div>
  )
}
