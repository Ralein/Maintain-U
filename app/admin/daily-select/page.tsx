"use client"

import { useState, useEffect } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BiUser, BiCheck, BiSearch, BiCalendarCheck } from "react-icons/bi"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function DailySelectPage() {
    const [selectedTechs, setSelectedTechs] = useState<string[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [technicians, setTechnicians] = useState<any[]>([])

    useEffect(() => {
        const fetchTechs = async () => {
            try {
                const res = await api.getTechnicians()
                if (res.technicians) {
                    // Filter mainly available ones, but show all for selection
                    // Maybe filter out 'Banned' or 'Rejected'
                    const validTechs = res.technicians.filter((t: any) => t.status !== 'Banned' && t.status !== 'Rejected' && t.status !== 'pending' && t.status !== 'Pending')
                    setTechnicians(validTechs)
                }
            } catch (e) {
                toast.error("Failed to load technicians")
            } finally {
                setLoading(false)
            }
        }
        fetchTechs()
    }, [])

    const handleToggle = (id: string) => {
        setSelectedTechs(prev =>
            prev.includes(id)
                ? prev.filter(t => t !== id)
                : [...prev, id]
        )
    }

    const handleSelectAll = () => {
        if (selectedTechs.length === technicians.length) {
            setSelectedTechs([])
        } else {
            setSelectedTechs(technicians.map(t => t.techId))
        }
    }

    const handleConfirmSelection = async () => {
        if (selectedTechs.length === 0) {
            toast.error("Please select at least one technician")
            return
        }

        setIsProcessing(true)
        try {
            const res = await api.createDailyRoster(selectedTechs)
            if (res.success) {
                toast.success(`Marked ${res.count} technicians as Present`)
                setSelectedTechs([])
            } else {
                toast.error(res.message || "Failed to update roster")
            }
        } catch (e) {
            toast.error("Error updating roster")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Sticky Header */}
            <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Daily Select</h1>
                    <p className="text-xs text-muted-foreground font-medium">Select staff for today's roster</p>
                </div>
                <ThemeToggle />
            </header>

            <main className="px-6 py-6 space-y-6">
                {/* Search & Statistics */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BiSearch className="text-muted-foreground w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-xl font-bold text-primary">{selectedTechs.length}</span>
                        <span className="text-[10px] uppercase font-bold text-primary/70">Selected</span>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSelectAll}
                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        {selectedTechs.length === technicians.length ? "Deselect All" : "Select All Available"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                        {technicians.length} technician(s) found
                    </span>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">Loading staff...</p>
                        </div>
                    ) : technicians.length === 0 ? (
                        <div className="text-center py-10 border border-dashed rounded-2xl">No technicians found</div>
                    ) : (
                        technicians.map((tech: any) => {
                            const isSelected = selectedTechs.includes(tech.techId)
                            return (
                                <div
                                    key={tech.techId}
                                    onClick={() => handleToggle(tech.techId)}
                                    className={`glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${isSelected
                                        ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                        : "hover:border-primary/30"
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted-foreground/30"
                                        }`}>
                                        {isSelected && <BiCheck className="w-4 h-4" />}
                                    </div>

                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-2xl shadow-inner">
                                        <BiUser className="text-muted-foreground" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`font-bold text-lg leading-tight transition-colors ${isSelected ? "text-primary" : ""}`}>
                                                {tech.name}
                                            </p>
                                            <span className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                                                ★ {tech.rating > 0 ? Number(tech.rating).toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{tech.skill}</p>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className={`text-[10px] font-bold uppercase ${tech.status === 'Available' ? 'text-green-500' : 'text-orange-500'
                                                }`}>
                                                {tech.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-[100px] left-6 right-6 z-40">
                <button
                    onClick={handleConfirmSelection}
                    disabled={selectedTechs.length === 0 || isProcessing}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <BiCalendarCheck className="w-6 h-6" />
                            Confirm Daily Roster
                        </>
                    )}
                </button>
            </div>

            <BottomNav active="more" role="admin" />
        </div>
    )
}
