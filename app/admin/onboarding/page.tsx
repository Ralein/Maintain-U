
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, User } from "@/lib/api"
import { ChevronLeft, Search, Check, X, Shield, Ban, Loader2, Filter } from "lucide-react"
import { toast } from "sonner"
import { BottomNav } from "@/components/navigation/bottom-nav"

export default function UserOnboardingPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "pending" | "active" | "banned">("pending")
    const [search, setSearch] = useState("")

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            // API currently doesn't support complex filtering, so we fetch all and filter client-side
            const res = await api.getUsers()
            if (res && res.users) {
                setUsers(res.users)
            }
        } catch (error) {
            toast.error("Failed to load users")
        } finally {
            setIsLoading(false)
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

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === "all" ? true : user.status === filter
        const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.phone.includes(search) ||
            user.role.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Sort: Pending first
    filteredUsers.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1
        if (a.status !== "pending" && b.status === "pending") return 1
        return 0
    })

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center gap-4 transition-all">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">User Management</h1>
                    <p className="text-xs text-muted-foreground font-medium">Verify & Manage Users</p>
                </div>
            </header>

            <main className="px-6 py-6 space-y-6">
                {/* Filters */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {(["all", "pending", "active", "banned"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${filter === f
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-muted-foreground border-border hover:bg-muted"
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No users found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="glass-card p-4 rounded-xl space-y-4 border border-border/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-foreground">{user.name || "Unknown User"}</h3>
                                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-muted text-muted-foreground border border-border">
                                                {user.role}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${user.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                    user.status === "pending" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                                        user.status === "banned" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                            "bg-gray-500/10 text-gray-600 border-gray-500/20"
                                                }`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {/* Date could go here if we tracked it per user properly */}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-border/50">
                                    {user.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "active")}
                                                className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Verify
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, "rejected")}
                                                className="flex-1 py-2 rounded-lg bg-muted hover:bg-red-100 text-foreground hover:text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {user.status === "active" && (
                                        <button
                                            onClick={() => handleStatusUpdate(user.id, "banned")}
                                            className="flex-1 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-red-200"
                                        >
                                            <Ban className="w-3.5 h-3.5" />
                                            Ban User
                                        </button>
                                    )}

                                    {user.status === "banned" && (
                                        <button
                                            onClick={() => handleStatusUpdate(user.id, "active")}
                                            className="flex-1 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-green-200"
                                        >
                                            <Shield className="w-3.5 h-3.5" />
                                            Unban / Restore
                                        </button>
                                    )}
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
