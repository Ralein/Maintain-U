"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { BiUser, BiCog, BiLogOut, BiChevronRight, BiBuilding, BiPhone, BiEnvelope, BiCreditCard, BiShield, BiEdit } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { getCompanyProfileAction } from "@/lib/actions"
import { api } from "@/lib/api"

export default function CompanyProfile() {
    const router = useRouter()

    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getCompanyProfileAction()
                if (res.success) {
                    setProfile(res.data)
                } else {
                    toast.error("Failed to load profile")
                }
            } catch (e) {
                toast.error("An error occurred")
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

    const menuItems = [
        { icon: BiBuilding, label: "Company Details", value: profile?.companyName || "Loading..." },
        { icon: BiPhone, label: "Contact Phone", value: profile?.phone || "Loading..." },
        { icon: BiEnvelope, label: "Email Address", value: profile?.email || "admin@example.com" },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Extended Header / Cover */}
            <div className="relative pt-10 pb-20 px-6 bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-border/50 rounded-b-[3rem]">
                <div className="mx-auto w-full max-w-md flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center ring-4 ring-white/50 dark:ring-white/10 p-1">
                            <BiBuilding className="w-12 h-12 text-primary" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <BiEdit className="w-4 h-4" />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">{profile?.companyName || "Company Profile"}</h1>
                    <p className="text-sm text-muted-foreground font-medium bg-background/50 backdrop-blur px-3 py-1 rounded-full border border-border/50">
                        #COMP-{profile?.userId?.substring(0, 4) || "000"} • {profile?.industry || "General"}
                    </p>
                </div>
            </div>

            {/* Menu Options */}
            <main className="px-6 -mt-10 space-y-5 mx-auto max-w-md relative z-10">
                {/* Info Card */}
                <section className="glass-card rounded-3xl p-2 shadow-xl shadow-black/5 dark:shadow-black/20">
                    {menuItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors rounded-2xl group cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">{item.label}</p>
                                    <p className="text-sm font-semibold">{item.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Settings & Actions */}
                <section className="glass-card rounded-3xl p-2">
                    <button
                        onClick={() => router.push("/company/settings")}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-2xl group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-500 group-hover:text-foreground transition-colors">
                                <BiCog className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm">App Settings</span>
                        </div>
                        <BiChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-2xl group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-500 group-hover:text-foreground transition-colors">
                                <BiShield className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm">Privacy & Security</span>
                        </div>
                        <BiChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>
                </section>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full glass-card p-4 rounded-3xl flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/5 hover:border-red-500/20 transition-all font-bold tracking-wide"
                >
                    <BiLogOut className="w-5 h-5" />
                    Log Out
                </button>

                <p className="text-center text-[10px] text-muted-foreground pt-2 pb-6">Version 1.0.0 • MaintainU</p>
            </main>

            <BottomNav active="profile" role="company" />
        </div>
    )
}
