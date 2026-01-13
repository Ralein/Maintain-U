"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LogOut, User, Bell, Shield, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AdminSettingsPage() {
    const router = useRouter()

    const handleLogout = async () => {
        await api.logout()
        router.push("/login")
        toast.success("Logged out successfully")
    }

    const menuItems = [
        { icon: User, label: "Account Profile", desc: "Manage your account details" },
        { icon: Bell, label: "Notifications", desc: "Configure alert preferences" },
        { icon: Shield, label: "Security", desc: "Password and 2FA settings" },
        { icon: HelpCircle, label: "Help & Support", desc: "Contact support team" },
    ]

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="px-6 py-6 bg-primary text-primary-foreground pb-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <ThemeToggle />
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/30 shadow-inner">
                        A
                    </div>
                    <div>
                        <p className="font-bold text-lg">Admin User</p>
                        <p className="text-primary-foreground/70 text-sm">Super Administrator</p>
                    </div>
                </div>
            </header>

            <main className="px-6 -mt-6 space-y-4 relative z-10">
                <div className="glass-card p-2 rounded-2xl">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 rounded-xl transition-all group text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full p-4 rounded-2xl glass-card flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 transition-all font-semibold"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </main>

            <BottomNav active="settings" role="admin" />
        </div>
    )
}
