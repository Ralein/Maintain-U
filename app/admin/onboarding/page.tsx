"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Search, User, Check, X, ShieldAlert, RotateCcw, Building2, Wrench } from "lucide-react"
import { api, User as UserType } from "@/lib/api"
import { toast } from "sonner"

export default function UserManagementPage() {
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "active" | "banned" | "rejected" | "reset">("pending")
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<{
        all: UserType[],
        pending: UserType[],
        active: UserType[],
        banned: UserType[],
        rejected: UserType[],
        reset: UserType[]
    }>({
        all: [],
        pending: [],
        active: [],
        banned: [],
        rejected: [],
        reset: []
    })
    const [search, setSearch] = useState("")

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await api.getUsers()
            if (res.users) {
                const all = res.users
                const pending = all.filter((u: any) => u.status === 'pending' || u.status === 'Pending')
                const active = all.filter((u: any) => (u.status === 'active' || u.status === 'Active') && u.resetStatus !== 'requested')
                const banned = all.filter((u: any) => u.status === 'banned' || u.status === 'Banned')
                const rejected = all.filter((u: any) => u.status === 'rejected' || u.status === 'Rejected')
                const reset = all.filter((u: any) => u.resetStatus === 'requested')

                setUsers({ all, pending, active, banned, rejected, reset })
            }
        } catch (e) {
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleStatusUpdate = async (userId: string, status: "active" | "banned" | "rejected" | "pending") => {
        try {
            await api.updateUserStatus(userId, status)
            toast.success(`User status updated to ${status}`)
            fetchUsers()
        } catch {
            toast.error("Failed to update status")
        }
    }

    const handleRoleToggle = async (user: UserType) => {
        const newRole = user.role === 'company' ? 'technician' : 'company'
        try {
            await api.updateUserStatus(user.id, user.status, newRole)
            toast.success(`Role switched to ${newRole}`)
            fetchUsers()
        } catch {
            toast.error("Failed to switch role")
        }
    }

    const handleApproveReset = async (userId: string) => {
        try {
            await api.approvePasswordReset(userId)
            toast.success("Password reset approved")
            fetchUsers()
        } catch {
            toast.error("Failed to approve reset")
        }
    }

    const filteredList = users[activeTab].filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    )

    const tabs: Array<"all" | "pending" | "active" | "banned" | "rejected" | "reset"> = ["all", "pending", "active", "banned", "rejected", "reset"]

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-xs text-muted-foreground font-medium">Verify & Manage Users</p>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="h-10 px-3 flex items-center justify-center bg-primary/10 text-primary rounded-xl font-bold text-xs shadow-sm ring-1 ring-primary/10">
                        {users.active.length} Active
                    </div>
                </div>
            </header>

            <main className="px-6 py-6 space-y-6">
                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-muted-foreground w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by name, phone, or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all border flex items-center gap-2 ${activeTab === tab
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                : "bg-transparent hover:bg-muted text-muted-foreground border-border"
                                }`}
                        >
                            <span className="capitalize">
                                {tab === "reset" ? "Reset Requests" : tab}
                            </span>

                            {(tab === "pending" || tab === "reset") && users[tab].length > 0 && (
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${activeTab === tab
                                    ? "bg-white/20 text-white"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                    }`}>
                                    {users[tab].length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-3">
                    {filteredList.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/5">
                            No users found
                        </div>
                    ) : (
                        filteredList.map((user) => (
                            <div
                                key={user.id}
                                className="glass-card p-4 rounded-2xl flex flex-col gap-4 group hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    {/* User Info */}
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-border/50 ${user.role === 'company'
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : user.role === 'technician'
                                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                                    : 'bg-slate-50 dark:bg-slate-900/20'
                                            }`}>
                                            {user.role === 'company' && <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                            {user.role === 'technician' && <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                                            {user.role === 'admin' && <ShieldAlert className="w-6 h-6 text-slate-600 dark:text-slate-400" />}
                                            {!['company', 'technician', 'admin'].includes(user.role) && <User className="w-6 h-6 text-muted-foreground" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                {user.name || "New User"}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                                {user.phone}
                                            </p>
                                            <div className="flex gap-2 mt-2">

                                                {/* Clickable Badge for Pending Users */}
                                                <button
                                                    disabled={user.status !== 'pending'}
                                                    onClick={() => handleRoleToggle(user)}
                                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 transition-all ${user.status === 'pending' ? 'cursor-pointer hover:ring-1 hover:ring-current active:scale-95' : 'cursor-default'
                                                        } ${user.role === 'company' ? 'bg-blue-500/10 text-blue-600' :
                                                            user.role === 'technician' ? 'bg-purple-500/10 text-purple-600' :
                                                                'bg-slate-500/10 text-slate-600'
                                                        }`}>
                                                    {user.role}
                                                    {user.status === 'pending' && <RotateCcw className="w-3 h-3 ml-1 opacity-50" />}
                                                </button>

                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${user.status === 'active' ? 'bg-green-500/10 text-green-600' :
                                                        user.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                                                            user.status === 'banned' ? 'bg-red-500/10 text-red-600' :
                                                                'bg-slate-500/10 text-muted-foreground'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-border/40">
                                    {user.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "active")}
                                                className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                                            >
                                                <Check className="w-4 h-4" strokeWidth={2.5} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "rejected")}
                                                className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30 active:scale-95"
                                            >
                                                <X className="w-4 h-4" strokeWidth={2.5} /> Reject
                                            </button>
                                        </>
                                    )}

                                    {user.status === 'rejected' && (
                                        <button
                                            onClick={() => handleStatusUpdate(user.id, "active")}
                                            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Re-admit / Approve
                                        </button>
                                    )}

                                    {user.resetStatus === 'requested' && (
                                        <button
                                            onClick={() => handleApproveReset(user.id)}
                                            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                                        >
                                            <ShieldAlert className="w-4 h-4" /> Enable Password Reset
                                        </button>
                                    )}

                                    {user.status === 'active' && user.resetStatus !== 'requested' && (
                                        <button
                                            onClick={() => handleStatusUpdate(user.id, "banned")}
                                            className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30 active:scale-95"
                                        >
                                            Ban User
                                        </button>
                                    )}

                                    {user.status === 'banned' && (
                                        <button
                                            onClick={() => handleStatusUpdate(user.id, "active")}
                                            className="flex-1 py-2.5 rounded-xl bg-white dark:bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted transition-all flex items-center justify-center gap-2"
                                        >
                                            Unban
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <BottomNav active="onboarding" role="admin" />
        </div>
    )
}
