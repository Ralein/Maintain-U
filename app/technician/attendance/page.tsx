"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { Calendar, CheckCircle, Clock, MapPin, XCircle } from "lucide-react"

export default function AttendancePage() {
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [todayStatus, setTodayStatus] = useState<"pending" | "present" | "leave">("pending")

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const res = await api.getTechnicianAttendance()
            if (res.success && res.data) {
                setHistory(res.data)

                // Check if marked for today
                const today = new Date().toISOString().split('T')[0]
                const todayRecord = res.data.find((r: any) => r.date === today)
                if (todayRecord) {
                    setTodayStatus(todayRecord.status as any)
                }
            }
        } catch (e) {
            console.error("Failed to fetch attendance")
        } finally {
            setLoading(false)
        }
    }

    const markAttendance = async (status: "present" | "leave") => {
        // Optimistic UI could be used here, but let's wait for API
        try {
            const res = await api.markAttendance(status)
            if (res.success) {
                setTodayStatus(status)
                fetchHistory() // Refresh list
            } else {
                alert(res.message || "Failed to mark attendance")
            }
        } catch (e) {
            console.error("Attendance error", e)
        }
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 mb-6 transition-all">
                <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                <p className="text-xs text-muted-foreground font-medium">Manage your daily work log</p>
            </header>

            <main className="px-6 space-y-6">

                {/* Today's Action Card */}
                <section>
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            {format(new Date(), "EEEE, MMM d")}
                        </div>

                        {todayStatus === 'pending' ? (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
                                    <Clock className="w-10 h-10 text-blue-500" />
                                </div>
                                <h2 className="text-lg font-bold">Not Checked In</h2>
                                <div className="flex w-full gap-3">
                                    <button
                                        onClick={() => markAttendance('present')}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Clock In
                                    </button>
                                    <button
                                        onClick={() => markAttendance('leave')}
                                        className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl transition-all hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Leave
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 w-full animate-in zoom-in duration-300">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${todayStatus === 'present' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    {todayStatus === 'present' ? (
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    ) : (
                                        <XCircle className="w-10 h-10 text-red-500" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{todayStatus === 'present' ? 'Clocked In' : 'On Leave'}</h2>
                                    <p className="text-xs text-muted-foreground">Recorded at {format(new Date(), "p")}</p>
                                </div>
                                <div className="w-full mt-2 p-3 bg-muted/50 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span>Location Captured</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* History List */}
                <section>
                    <h3 className="text-lg font-bold mb-4">History</h3>
                    <div className="space-y-3">
                        {history.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm py-8">No records found</p>
                        ) : (
                            history.map((record) => (
                                <div key={record.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${record.status === 'present' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                            <Calendar className={`w-5 h-5 ${record.status === 'present' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{format(new Date(record.date), "MMM d, yyyy")}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{record.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold font-mono">{record.checkInTime || "-"}</p>
                                        <p className="text-[10px] text-muted-foreground">Check In</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </main>
            <BottomNav active="attendance" role="technician" />
        </div>
    )
}
