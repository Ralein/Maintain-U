"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { CheckCircle2, Loader2, ArrowLeft, Users, Star, MessageSquare } from "lucide-react"
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

            {/* Photos Section */}
            {request.photos && (request.photos as any[]).filter((url: string) => url?.trim() !== "").length > 0 && (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                        Reference Photos
                        <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-1 rounded-md tracking-widest uppercase">
                            {(request.photos as any[]).filter((url: string) => url?.trim() !== "").length} Files
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(request.photos as any[]).filter((url: string) => url?.trim() !== "").map((url: string, idx: number) => (
                            <div
                                key={idx}
                                className="aspect-[4/3] relative rounded-[1.5rem] overflow-hidden glass border border-border/50 group cursor-pointer shadow-lg hover:shadow-primary/10 transition-all active:scale-[0.98]"
                                onClick={() => window.open(url, '_blank')}
                            >
                                <img
                                    src={url}
                                    alt={`Issue photo ${idx + 1}`}
                                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://placehold.co/400x300/e2e8f0/64748b?text=Broken+Link"
                                    }}
                                />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-white/90 dark:bg-black/50 p-2.5 rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <p className="text-[8px] font-black text-white uppercase tracking-widest text-center">Tap to expand</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Client Feedback Section */}
            {(request as any).isRated && (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        Client Feedback
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-black">{(request as any).ratingScore}</span>
                        </div>
                    </h2>
                    <div className="glass-card p-6 rounded-[2rem] border-yellow-500/20 bg-yellow-500/5 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-yellow-600" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Company Review</p>
                        </div>
                        <p className="text-sm font-medium italic text-foreground/80 leading-relaxed">
                            "{(request as any).ratingReview || "The company provided a rating without additional comments."}"
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                {(request as any).technicianName?.charAt(0) || 'T'}
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">Work verified by <span className="text-foreground">{(request as any).technicianName}</span></p>
                        </div>

                        <Star className="absolute top-[-20px] right-[-20px] w-24 h-24 text-yellow-500/10 rotate-12" />
                    </div>
                </div>
            )}

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
