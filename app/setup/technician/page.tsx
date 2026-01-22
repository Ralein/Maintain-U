"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Wrench, Loader2, MapPin, Briefcase, Star, Info } from "lucide-react"
import { completeTechnicianProfileAction } from "@/lib/actions"

export default function TechnicianSetupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        experience: "",
        primarySkill: "",
        skills: "",
        address: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await completeTechnicianProfileAction({
                ...formData,
                experience: Number(formData.experience),
            })
            if (res?.success) {
                toast.success("Profile completed successfully!")
                router.push("/technician/dashboard")
            } else {
                toast.error(res?.message || "Failed to update profile")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-lg glass p-8 rounded-3xl shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-primary/5">
                        <Wrench className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                    <p className="text-muted-foreground text-sm">Add your skills to get matched with jobs</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Primary Skill</label>
                        <div className="relative">
                            <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                required
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                value={formData.primarySkill}
                                onChange={(e) => setFormData({ ...formData, primarySkill: e.target.value })}
                            >
                                <option value="">Select Primary Skill</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="HVAC">HVAC</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Assembly">Assembly</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Years of Experience</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="number"
                                min="0"
                                max="50"
                                required
                                placeholder="e.g. 5"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Other Skills (Optional)</label>
                        <div className="relative">
                            <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="e.g. Welding, Painting (Comma separated)"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Current Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
                            <textarea
                                required
                                placeholder="Where do you live?"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white/50 dark:bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? "Saving Profile..." : "Save & Continue"}
                    </button>
                </form>
            </div>
        </div>
    )
}
