"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { CheckCircle2, User, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function AssignTeamPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [technicians, setTechnicians] = useState<any[]>([])
    const [selectedTechs, setSelectedTechs] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [assigning, setAssigning] = useState(false)

    useEffect(() => {
        const fetchTechs = async () => {
            try {
                const res = await api.getTechnicians()
                setTechnicians(res.technicians)
            } catch (e) {
                toast.error("Failed to load technicians")
            } finally {
                setLoading(false)
            }
        }
        fetchTechs()
    }, [])

    const toggleTech = (id: string) => {
        if (selectedTechs.includes(id)) {
            setSelectedTechs(selectedTechs.filter((tid) => tid !== id))
        } else {
            setSelectedTechs([...selectedTechs, id])
        }
    }

    const handleAssign = async () => {
        if (selectedTechs.length === 0) return
        setAssigning(true)
        try {
            // Assuming first selected is lead for now or random
            const leadId = selectedTechs[0]
            await api.assignTeam(params.id, selectedTechs, leadId)
            toast.success("Team assigned successfully")
            router.push("/admin/requests")
        } catch (e) {
            toast.error("Failed to assign team")
        } finally {
            setAssigning(false)
        }
    }

    return (
        <div className="min-h-screen px-6 pt-6 pb-20">
            {/* Header */}
            <div className="mb-6">
                <button onClick={() => router.back()} className="mb-4 p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Assign Team</h1>
                <p className="text-muted-foreground text-sm">Select technicians for Request {params.id}</p>
            </div>

            {/* Tech List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-3 mb-8">
                    {technicians.length === 0 ? (
                        <p className="text-muted-foreground text-center">No technicians available</p>
                    ) : (
                        technicians.map((tech) => (
                            <div
                                key={tech.id}
                                onClick={() => toggleTech(tech.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTechs.includes(tech.id)
                                        ? "bg-blue-500/10 border-blue-500"
                                        : "bg-card border-border hover:border-primary/50"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{tech.name}</p>
                                            <p className="text-xs text-muted-foreground">{tech.skill} • {tech.status}</p>
                                        </div>
                                    </div>
                                    {selectedTechs.includes(tech.id) && (
                                        <CheckCircle2 className="w-6 h-6 text-blue-500 fill-current" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={handleAssign}
                disabled={selectedTechs.length === 0 || assigning}
                className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {assigning && <Loader2 className="w-5 h-5 animate-spin" />}
                {assigning ? "Assigning..." : `Assign ${selectedTechs.length} Technician${selectedTechs.length !== 1 ? 's' : ''}`}
            </button>
        </div>
    )
}
