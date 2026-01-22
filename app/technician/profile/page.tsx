"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { User, Settings, LogOut, ChevronRight, PenTool, Star, Award, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { getTechnicianProfileAction } from "@/lib/actions"
import { api } from "@/lib/api"

export default function TechnicianProfile() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getTechnicianProfileAction()
                if (res.success) {
                    setProfile(res.data)
                }
            } catch (e) {
                // silent error
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleLogout = async () => {
        await api.logout()
        router.push("/login")
    }

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header Profile Card */}
            <div className="relative pt-10 pb-16 px-6 bg-gradient-to-br from-indigo-500/20 via-indigo-500/5 to-background border-b border-border/50 rounded-b-[2.5rem]">
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-4 ring-4 ring-white/50 dark:ring-white/10 relative">
                        <User className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-yellow-900 shadow-sm">
                            4.8
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{profile?.name || "Technician Name"}</h1>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                        <PenTool className="w-3 h-3" /> {profile?.primarySkill || "Skill Not Set"}
                    </p>
                </div>
            </div>

            {/* Menu Options */}
            <div className="px-6 -mt-8 space-y-4">

                {/* Stats Row */}
                <div className="flex gap-3">
                    <div className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-2xl font-bold text-primary">142</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Jobs Done</p>
                    </div>
                    <div className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-2xl font-bold text-green-500">98%</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">On Time</p>
                    </div>
                    <div className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-2xl font-bold text-orange-500">12</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Streak</p>
                    </div>
                </div>

                {/* Details Card */}
                <div className="glass-card rounded-2xl p-2 shadow-lg shadow-black/5">
                    <div className="flex items-center justify-between p-4 border-b border-border/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Service Area</p>
                                <p className="text-sm font-semibold">{profile?.address || "Not Set"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Expertise</p>
                                <p className="text-sm font-semibold">{profile?.primarySkill || "Not Set"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="glass-card rounded-2xl p-2">
                    <button
                        onClick={() => router.push("/technician/settings")}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-xl group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-slate-500/10 rounded-xl text-slate-500 group-hover:text-foreground transition-colors">
                                <Settings className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm">Settings</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full glass-card p-4 rounded-2xl flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/5 hover:border-red-500/20 transition-all font-semibold"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>

            <BottomNav active="profile" role="technician" />
        </div>
    )
}
