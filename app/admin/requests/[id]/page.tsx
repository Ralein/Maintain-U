"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { CheckCircle2, Loader2, ArrowLeft, Users } from "lucide-react"
import { useEffect, useState, use } from "react"
import { api, Request } from "@/lib/api"
import { useRouter } from "next/navigation"
import { formatTicketId } from "@/lib/utils"

export default function AdminRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [request, setRequest] = useState<Request | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.getRequestById(id)
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
    }, [id])

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

    return (
        <div className="min-h-screen px-6 pt-6 pb-32">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => router.back()} className="mb-4 p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{formatTicketId(request.id)}</h1>
                </div>
                <div className="mt-2 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${request.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        request.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                            request.status === 'New' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                        }`}>
                        {request.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${request.priority === 'Emergency' ? 'bg-red-500/10 text-red-600' :
                        request.priority === 'Urgent' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {request.priority}
                    </span>
                </div>
            </div>

            {/* Request Details */}
            <div className="mb-8">
                <h2 className="text-lg font-bold mb-4">Details</h2>
                <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Company</p>
                        <p className="font-semibold">{request.companyName || request.companyId}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Service Type</p>
                        <p className="font-semibold">{request.serviceType || "General"}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                        <p>{request.description}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Submitted Date</p>
                        <p className="font-semibold">{request.preferredDate || (request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "Unknown")}</p>
                    </div>
                    {request.timeSlot && (
                        <div className="p-4 rounded-lg bg-card border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Preferred Time</p>
                            <p className="font-semibold">{request.timeSlot}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {request.status === 'New' && (
                <div className="fixed bottom-24 left-6 right-6">
                    <button
                        onClick={() => router.push(`/admin/jobs/${request.id}/assign`)}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                        <Users className="w-5 h-5" />
                        Assign Team
                    </button>
                </div>
            )}

            <BottomNav active="jobs" role="admin" />
        </div>
    )
}
