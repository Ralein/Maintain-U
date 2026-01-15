"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, User } from "@/lib/api"
import { ChevronLeft, Search, Check, X, Shield, Ban, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { BottomNav } from "@/components/navigation/bottom-nav"

export default function UserOnboardingPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "pending" | "active" | "banned" | "resets">("pending")
    const [search, setSearch] = useState("")
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            // API currently doesn't support complex filtering, so we fetch all and filter client-side
            const res = await api.getUsers()
            if (res && res.users) {
                const typedUsers = res.users.map((u: any) => ({
                    ...u,
                    name: u.name || undefined
                }))
                setUsers(typedUsers)
            }
        } catch (error) {
            toast.error("Failed to load users")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleStatusUpdate = async (userId: string, newStatus: "active" | "banned" | "pending" | "rejected", newRole?: string) => {
        try {
            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus, ...(newRole ? { role: newRole as any } : {}) } : u))

            const res = await api.updateUserStatus(userId, newStatus, newRole)
            if (res.success) {
                toast.success(`User updated to ${newStatus}`)
            } else {
                // Revert on failure (reload)
                fetchUsers()
                toast.error("Failed to update user")
            }
        } catch (error) {
            fetchUsers()
            toast.error("Error updating user")
        }
    }

    const handleApproveReset = async (userId: string) => {
        try {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, resetStatus: "approved" } : u))

            const res = await api.approvePasswordReset(userId)
            if (res.success) {
                toast.success("Password reset approved")
            } else {
                fetchUsers()
                toast.error("Failed to approve reset")
            }
        } catch (error) {
            fetchUsers()
            toast.error("Error approving reset")
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === "all" ? true :
            filter === "resets" ? user.resetStatus === "requested" :
                user.status.toLowerCase() === filter.toLowerCase()
        const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.phone.includes(search) ||
            user.role.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Sort: Pending first
    filteredUsers.sort((a, b) => {
        if (filter === "resets") return 0 // Keep default order for resets
        if (a.status === "pending" && b.status !== "pending") return -1
        if (a.status !== "pending" && b.status === "pending") return 1
        return 0
    })

    return (
        <div className="min-h-screen pb-32 app-gradient">
            {/* Header */}
            <header className="sticky top-0 z-20 px-6 py-4 glass border-b border-white/20 flex items-center gap-4 transition-all">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">User Management</h1>
                    <p className="text-xs text-muted-foreground font-medium">Verify & Manage Users</p>
                </div>
                <button
                    onClick={() => { setIsRefreshing(true); fetchUsers(); }}
                    className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-5 h-5 text-muted-foreground" />
                </button>
            </header>

            <main className="px-6 py-6 space-y-6">
                {/* Search & Filters */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search users by name, phone, or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/40 dark:bg-black/20 focus:bg-white/60 dark:focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-md"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
                        {(["all", "pending", "active", "banned", "resets"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === f
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                    : "bg-white/40 dark:bg-black/20 text-muted-foreground border-white/20 hover:bg-white/60 dark:hover:bg-white/10"
                                    }`}
                            >
                                {f === "resets" ? "Reset Requests" : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User List */}
                <div className="space-y-4">
                    {isLoading && !isRefreshing ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2 glass-card rounded-2xl border-dashed border-2 border-white/20">
                            <Search className="w-8 h-8 opacity-20" />
                            <p className="font-medium">No users found</p>
                            <p className="text-xs opacity-60">Try adjusting your filters</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="glass-card p-5 rounded-2xl space-y-4 border-white/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-foreground">{user.name || "Unknown User"}</h3>
                                        <p className="text-sm font-mono text-muted-foreground tracking-wide">{user.phone}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-black/5 dark:bg-white/5 text-muted-foreground border border-black/5 dark:border-white/10">
                                                {user.role}
                                            </span>
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${user.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                user.status === "pending" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                                    user.status === "banned" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                        "bg-gray-500/10 text-gray-600 border-gray-500/20"
                                                }`}>
                                                {user.status}
                                            </span>
                                            {user.resetStatus === 'requested' && (
                                                <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 animate-pulse">
                                                    Reset Requested
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {/* Status Icon */}
                                        {user.status === 'active' && <Check className="w-5 h-5 text-green-500" />}
                                        {user.status === 'banned' && <Ban className="w-5 h-5 text-red-500" />}
                                        {user.status === 'pending' && <RefreshCw className="w-5 h-5 text-orange-500" />}
                                    </div>
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                                    {(user.status === "pending" || (user.status as string) === "Pending") ? (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "active")}
                                                className="py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "rejected")}
                                                className="py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-red-500/20"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Reject
                                            </button>
                                        </>
                                    ) : user.status === "active" ? (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "banned")}
                                                className="col-span-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-red-500/20"
                                            >
                                                <Ban className="w-3.5 h-3.5" />
                                                Ban
                                            </button>
                                            <div className="col-span-1"></div> {/* Spacer to keep Grid layout consistent if you want */}
                                        </>
                                    ) : user.status === "banned" ? (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "active")}
                                                className="col-span-2 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-green-500/20"
                                            >
                                                <Shield className="w-3.5 h-3.5" />
                                                Unban User
                                            </button>
                                        </>
                                    ) : null}

                                    {/* Password Reset Action - Spans full width if needed or sits in grid */}
                                    <button
                                        onClick={() => handleApproveReset(user.id)}
                                        className={`col-span-2 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${user.resetStatus === 'approved'
                                            ? "bg-green-500/5 text-green-600 border border-green-500/10 cursor-default opacity-60"
                                            : "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/20"
                                            }`}
                                        disabled={user.resetStatus === 'approved'}
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        {user.resetStatus === 'approved' ? "Reset Enabled" : "Enable Password Reset"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <BottomNav active="home" role="admin" />
        </div>
    )
}
