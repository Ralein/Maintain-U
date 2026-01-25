"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { ArrowLeft, Star, MessageSquare, Briefcase, User, Loader2, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function AdminFeedbackPage() {
    const router = useRouter()
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await api.getFeedback()
                if (res.success && res.feedback) {
                    setFeedbacks(res.feedback)
                }
            } catch (e) {
                console.error("Failed to load feedback")
            } finally {
                setLoading(false)
            }
        }
        fetchFeedback()
    }, [])

    return (
        <div className="min-h-screen pb-32">
            <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Client Feedbacks</h1>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Reviews & Ratings</p>
                </div>
            </header>

            <main className="px-6 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading reviews...</p>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="glass-card p-12 text-center border-dashed border-2 flex flex-col items-center gap-4 mt-10">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground/30">
                            <Star className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">No Feedbacks Yet</p>
                            <p className="text-sm text-muted-foreground px-4">When companies complete and rate jobs, they will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {feedbacks.map((f: any) => (
                            <div key={f.id} className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden group shadow-lg">
                                {/* Rating Badge */}
                                <div className="absolute top-6 right-6 flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full border border-yellow-500/20">
                                    <span className="text-sm font-black">{f.score}</span>
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm tracking-tight">{f.companyName}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{f.serviceType}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-3.5 h-3.5 text-primary/60" />
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Feedback</p>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                                            "{f.review || "No verbal feedback provided."}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                {f.technicianName?.charAt(0)}
                                            </div>
                                            <p className="text-xs font-bold text-muted-foreground tracking-tight">
                                                Tech: <span className="text-foreground">{f.technicianName}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <p className="text-[10px] font-bold uppercase tracking-tighter">
                                                {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "Recently"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav active="home" role="admin" />
        </div>
    )
}
