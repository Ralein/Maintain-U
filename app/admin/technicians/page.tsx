"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BiUser, BiCheck, BiX, BiSearch } from "react-icons/bi"
import { toast } from "sonner"

export default function AdminTechniciansPage() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active">("all")
  const [technicians, setTechnicians] = useState({
    all: [
      { id: "T-001", name: "Raj Kumar", skill: "Electrical", rating: 4.8, status: "Available" },
      { id: "T-002", name: "Priya Singh", skill: "Mechanical", rating: 4.6, status: "Available" },
      { id: "T-003", name: "Amit Patel", skill: "HVAC", rating: 4.9, status: "Busy" },
    ],
    pending: [
      { id: "T-004", name: "Rohan Verma", skill: "Electrical", rating: 0, status: "Pending" },
      { id: "T-005", name: "Deepak Rao", skill: "Plumbing", rating: 0, status: "Pending" },
    ],
    active: [
      { id: "T-001", name: "Raj Kumar", skill: "Electrical", rating: 4.8, status: "Available" },
      { id: "T-003", name: "Amit Patel", skill: "HVAC", rating: 4.9, status: "Busy" },
    ],
  })

  // Helper to handle approval
  const handleApprove = (id: string, name: string) => {
    toast.success(`Approved technician ${name}`)
    // In a real app, API call here updates status. For UI demo:
    const tech = technicians.pending.find(t => t.id === id)
    if (tech) {
      setTechnicians(prev => ({
        ...prev,
        pending: prev.pending.filter(t => t.id !== id),
        active: [...prev.active, { ...tech, status: "Available" }],
        all: [...prev.all.filter(t => t.id !== id), { ...tech, status: "Available" }]
      }))
    }
  }

  const handleReject = (id: string, name: string) => {
    toast.error(`Rejected technician ${name}`)
    setTechnicians(prev => ({
      ...prev,
      pending: prev.pending.filter(t => t.id !== id)
    }))
  }

  // Determine list based on tab
  const currentList = activeTab === 'all' ? technicians.all : activeTab === 'pending' ? technicians.pending : technicians.active

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between transition-all">
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
            <BiSearch className="text-muted-foreground w-5 h-5" />
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
              className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all border relative ${activeTab === tab
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-transparent hover:bg-muted text-muted-foreground border-border"
                }`}
            >
              {tab === "all" && "All Staff"}
              {tab === "pending" && "Pending Approval"}
              {tab === "active" && "On Duty"}

              {tab === "pending" && technicians.pending.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold ring-2 ring-background">
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
                className="glass-card p-4 rounded-2xl flex flex-col gap-4 group hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-2xl shadow-inner">
                      <BiUser className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{tech.name}</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{tech.skill}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${tech.status === "Available"
                      ? "bg-green-500/10 text-green-600"
                      : tech.status === "Busy"
                        ? "bg-orange-500/10 text-orange-600"
                        : "bg-yellow-500/10 text-yellow-600"
                      }`}
                  >
                    {tech.status}
                  </span>
                </div>

                {activeTab === 'pending' ? (
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleApprove(tech.id, tech.name)}
                      className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                    >
                      <BiCheck className="w-5 h-5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(tech.id, tech.name)}
                      className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30 active:scale-95"
                    >
                      <BiX className="w-5 h-5" /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>ID: <span className="font-mono">{tech.id}</span></span>
                    <span className="flex items-center gap-1 text-yellow-500 font-bold">
                      ★ {tech.rating > 0 ? tech.rating : 'N/A'}
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
