"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { CheckCheck, Clock, Bell, Info, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api, Notification } from "@/lib/api"
import { toast } from "sonner"

export default function CompanyNotifications() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const res = await api.getNotifications()
            setNotifications(res.notifications || [])
        } catch (e) {
            console.error("Failed to fetch notifications")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleMarkAsRead = async (id: string, link?: string) => {
        try {
            await api.markNotificationAsRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            if (link) router.push(link)
        } catch (e) {
            toast.error("Failed to update notification")
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await api.markAllNotificationsAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            toast.success("All notifications marked as read")
        } catch (e) {
            toast.error("Failed to update notifications")
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'Job_Update': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'Payment': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
            case 'System': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    }

    const formatTime = (date: any) => {
        const d = new Date(date)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    return (
        <div className="min-h-screen pb-32 app-gradient">
            {/* Header */}
            <header className="sticky top-0 z-30 px-6 py-6 glass border-b-0 mb-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all active:scale-90">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">Notifications</h1>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Real-time Updates</p>
                    </div>
                </div>
                <button
                    onClick={handleMarkAllAsRead}
                    className="w-10 h-10 flex items-center justify-center glass hover:bg-primary/10 rounded-xl transition-all active:scale-95 text-primary"
                    title="Mark all as read"
                >
                    <CheckCheck className="w-5 h-5" />
                </button>
            </header>

            <main className="px-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Syncing alerts...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-10 text-center glass-card rounded-[2.5rem] border-dashed border-2">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                            <Bell className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-black text-xl text-foreground mb-2">All Caught Up!</h3>
                        <p className="text-xs text-muted-foreground font-medium max-w-[200px] leading-relaxed">You have no new notifications at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {notifications.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => handleMarkAsRead(note.id, note.link || undefined)}
                                className={`group glass-card p-5 rounded-[1.75rem] flex gap-4 transition-all cursor-pointer relative overflow-hidden border border-white/10 ${!note.isRead ? "bg-primary/5 ring-1 ring-primary/20 shadow-xl shadow-primary/5" : "opacity-80"
                                    }`}
                            >
                                <div className={`mt-0.5 p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${!note.isRead ? 'bg-primary/20' : 'bg-muted'}`}>
                                    {getIcon(note.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className={`font-black text-sm leading-tight transition-colors ${!note.isRead ? "text-foreground group-hover:text-primary" : "text-muted-foreground"}`}>{note.title}</h3>
                                        {!note.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-3">{note.message}</p>

                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatTime(note.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>
                        ))}

                        <div className="flex flex-col items-center gap-4 py-12">
                            <div className="h-px w-12 bg-border/50" />
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">End of Notifications</p>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav active="alerts" role="company" />
        </div>
    )
}
