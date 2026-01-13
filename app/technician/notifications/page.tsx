"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Bell, CheckCircle, AlertTriangle, Briefcase, Clock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TechnicianNotifications() {
    const router = useRouter()

    const notifications = [
        {
            id: 1,
            type: "info",
            title: "New Job Assigned",
            message: "You have been assigned a new electrical maintenance job at ABC Industries.",
            time: "10 mins ago",
            read: false,
        },
        {
            id: 2,
            type: "warning",
            title: "Shift Reminder",
            message: "Your shift starts in 1 hour. Please mark your attendance.",
            time: "1 hour ago",
            read: true,
        },
        {
            id: 3,
            type: "success",
            title: "Payment Credited",
            message: "Daily wage payment of ₹850 has been credited to your account.",
            time: "Yesterday",
            read: true,
        },
    ]

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <div className="px-6 pt-6 pb-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-1 hover:bg-muted rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight">Updates</h1>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 space-y-4">
                {notifications.map((note) => (
                    <div
                        key={note.id}
                        className={`glass-card p-4 rounded-xl flex gap-4 transition-all ${!note.read ? "border-l-4 border-l-primary bg-primary/5" : "border-l-transparent"
                            }`}
                    >
                        <div className={`mt-1 p-2 rounded-full shrink-0 ${note.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                note.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                    'bg-blue-500/10 text-blue-500'
                            }`}>
                            {note.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                                note.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                    <Briefcase className="w-5 h-5" />}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-semibold text-sm ${!note.read ? "text-foreground" : "text-muted-foreground"}`}>{note.title}</h3>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {note.time}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{note.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav active="home" role="technician" />
        </div>
    )
}
