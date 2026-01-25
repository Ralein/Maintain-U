"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Search, User, Check, X, Star, MapPin, FileText, ExternalLink } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AdminTechniciansPage() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active">("all")
  const [loading, setLoading] = useState(true)
  const [technicians, setTechnicians] = useState<{ all: any[], pending: any[], active: any[] }>({
    all: [],
    pending: [],
    active: []
  })

  const fetchTechs = async () => {
    try {
      setLoading(true)
      const res = await api.getTechnicians()
      if (res.technicians) {
        const all = res.technicians
        const pending = all.filter((t: any) => (t.status === 'Pending' || t.status === 'pending') && t.name !== 'New User')
        const active = all.filter((t: any) => t.status !== 'Pending' && t.status !== 'pending' && t.status !== 'Banned')
        setTechnicians({ all, pending, active })
      }
    } catch (e) {
      toast.error("Failed to load technicians")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechs()
  }, [])

  // Helper to handle approval
  const handleApprove = async (id: string, name: string) => {
    try {
      await api.updateUserStatus(id, "active")
      toast.success(`Approved technician ${name}`)
      fetchTechs()
    } catch {
      toast.error("Failed to approve")
    }
  }

  const handleReject = async (id: string, name: string) => {
    try {
      await api.updateUserStatus(id, "rejected")
      toast.error(`Rejected technician ${name}`)
      fetchTechs()
    } catch {
      toast.error("Failed to reject")
    }
  }

  // Determine list based on tab
  const currentList = activeTab === 'all' ? technicians.all : activeTab === 'pending' ? technicians.pending : technicians.active

  return (
    <div className="min-h-screen pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Technicians</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage your workforce</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-10 px-3 flex items-center justify-center bg-primary/10 text-primary rounded-xl font-bold text-xs shadow-sm ring-1 ring-primary/10">
            {technicians.active.length} Active
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
            placeholder="Search technicians..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(["all", "pending", "active"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all border flex items-center gap-2 ${activeTab === tab
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-transparent hover:bg-muted text-muted-foreground border-border"
                }`}
            >
              <span>
                {tab === "all" && "All Staff"}
                {tab === "pending" && "Onboarding"}
                {tab === "active" && "On Duty"}
              </span>

              {tab === "pending" && technicians.pending.length > 0 && (
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${activeTab === tab
                  ? "bg-white/20 text-white"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}>
                  {technicians.pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-3">
          {currentList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/5">
              <p>No technicians found</p>
            </div>
          ) : (
            currentList.map((tech) => (
              <div
                key={tech.id}
                className="glass-card p-4 rounded-2xl flex flex-col gap-4 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-900/50 flex items-center justify-center shadow-inner ring-1 ring-border/50">
                      <User className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {tech.name === "New User" && tech.phone ? `New User (${tech.phone})` : tech.name}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                        {tech.skill || "General Technician"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground font-medium">
                          {tech.locationName === "Unknown Location" ? "Not Checked In" : tech.locationName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${tech.status === "Available"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : tech.status === "Pending"
                        ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }`}
                  >
                    {tech.status}
                  </span>
                </div>

                {/* Resume Verification Link */}
                {tech.documents?.resume && (tech.status === 'Pending' || activeTab === 'pending') && (
                  <div className="mt-2 mb-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Resume Submitted</span>
                    </div>
                    <a href={tech.documents.resume} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold bg-background px-3 py-1.5 rounded-lg border shadow-sm hover:bg-muted transition-colors flex items-center gap-1">
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {activeTab === 'pending' || tech.status === 'Pending' ? (
                  <div className="flex gap-2 pt-3 border-t border-border/40">
                    <button
                      onClick={() => handleApprove(tech.id, tech.name)}
                      className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                    >
                      <Check className="w-4 h-4" strokeWidth={2.5} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(tech.id, tech.name)}
                      className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30 active:scale-95"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
                    <span className="font-mono opacity-70">{tech.phone || tech.id.slice(0, 8)}</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-current" /> {tech.rating > 0 ? Number(tech.rating).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav active="team" role="admin" />
    </div>
  )
}
