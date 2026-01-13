"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { BiCheckCircle, BiError, BiInfoCircle, BiTime, BiCheckDouble } from "react-icons/bi"
import { useRouter } from "next/navigation"

export default function CompanyNotifications() {
    const router = useRouter()

    const notifications = [
        {
            id: 1,
            type: "success",
            title: "Request Completed",
            message: "Technician finished the maintenance for REQ-002",
            time: "2 hours ago",
            read: false,
        },
        {
            id: 2,
            type: "info",
            title: "Technician Assigned",
            message: "John Doe has been assigned to your electrical request",
            time: "5 hours ago",
            read: true,
        },
        {
            id: 3,
            type: "warning",
            title: "Maintenance Due",
            message: "Scheduled maintenance for Assembly Line B is due tomorrow",
            time: "1 day ago",
            read: true,
        },
    ]

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 px-6 py-5 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
                    <p className="text-xs text-muted-foreground font-medium">Updates & Notifications</p>
                </div>
                <button className="p-2.5 hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 text-primary">
                    <BiCheckDouble className="w-6 h-6" />
                </button>
            </header>

            <main className="px-6 py-6 space-y-4">
                {notifications.map((note) => (
                    <div
                        key={note.id}
                        className={`glass-card p-4 rounded-2xl flex gap-4 transition-all hover:border-primary/30 relative overflow-hidden ${!note.read ? "bg-primary/5 border-l-4 border-l-primary shadow-primary/5" : ""
                            }`}
                    >
                        <div className={`mt-1 p-2.5 rounded-full shrink-0 ${note.type === 'success' ? 'bg-green-500/10 text-green-500' :
                            note.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                'bg-blue-500/10 text-blue-500'
                            }`}>
                            {note.type === 'success' ? <BiCheckCircle className="w-6 h-6" /> :
                                note.type === 'warning' ? <BiError className="w-6 h-6" /> :
                                    <BiInfoCircle className="w-6 h-6" />}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1.5">
                                <h3 className={`font-bold text-sm leading-tight ${!note.read ? "text-foreground" : "text-muted-foreground"}`}>{note.title}</h3>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                                    <BiTime className="w-3 h-3" />
                                    <span>{note.time}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{note.message}</p>
                        </div>

                        {!note.read && (
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10" />
                        )}
                    </div>
                ))}

                <div className="text-center pt-8">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">End of List</p>
                </div>
            </main>

            <BottomNav active="alerts" role="company" />
        </div>
    )
}
