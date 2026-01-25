"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { BiUser, BiCog, BiLogOut, BiChevronRight, BiMapPin, BiBriefcaseAlt, BiAward, BiEdit, BiPhone } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { getTechnicianProfileAction, updateTechnicianProfileAction } from "@/lib/actions"
import { api } from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TechnicianProfile() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingData, setEditingData] = useState<any>({})
    const [updating, setUpdating] = useState(false)

    const fetchProfile = async () => {
        try {
            const res = await getTechnicianProfileAction()
            if (res.success) {
                setProfile(res.data)
                setEditingData({
                    name: res.data?.name,
                    primarySkill: res.data?.primarySkill,
                    address: res.data?.address,
                    experience: res.data?.experience,
                    dob: res.data?.dob,
                    gender: res.data?.gender,
                    dailyRate: res.data?.dailyRate,
                    bankName: (res.data as any)?.bankDetails?.bankName,
                    accountHolder: (res.data as any)?.bankDetails?.accountHolder,
                    accountNumber: (res.data as any)?.bankDetails?.accountNumber,
                    ifsc: (res.data as any)?.bankDetails?.ifsc,
                    upi: (res.data as any)?.bankDetails?.upi,
                })
            } else {
                toast.error("Failed to load profile")
            }
        } catch (e) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleLogout = async () => {
        await api.logout()
        router.push("/login")
    }

    const handleUpdateProfile = async () => {
        setUpdating(true)
        try {
            const { bankName, accountHolder, accountNumber, ifsc, upi, ...rest } = editingData
            const formattedData = {
                ...rest,
                bankDetails: { bankName, accountHolder, accountNumber, ifsc, upi }
            }
            const res = await updateTechnicianProfileAction(formattedData)
            if (res.success) {
                toast.success("Profile updated")
                setIsEditing(false)
                fetchProfile()
            } else {
                toast.error(res.message || "Update failed")
            }
        } catch (e) {
            toast.error("Failed to update profile")
        } finally {
            setUpdating(false)
        }
    }

    const menuItems = [
        { icon: BiMapPin, label: "Service Area", value: profile?.address || "Not Set" },
        { icon: BiBriefcaseAlt, label: "Experience", value: profile?.experience ? `${profile.experience} Years` : "Not Set" },
        { icon: BiAward, label: "Expertise", value: profile?.primarySkill || "Not Set" },
        { icon: BiPhone, label: "Contact Phone", value: profile?.phone || "Not Set" },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-32 bg-background text-foreground">
            {/* Extended Header / Cover */}
            <div className="relative pt-10 pb-20 px-6 bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-border/50 rounded-b-[3rem]">
                <div className="mx-auto w-full max-w-md flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center ring-4 ring-white/50 dark:ring-white/10 p-1 relative">
                            <BiUser className="w-12 h-12 text-primary" />
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-yellow-400 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-yellow-900 shadow-sm">
                                {profile?.rating && profile.rating > 0 ? profile.rating.toFixed(1) : "N/A"}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute -top-1 -right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                        >
                            <BiEdit className="w-4 h-4" />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">{profile?.name || "Technician Name"}</h1>
                    <p className="text-sm text-muted-foreground font-medium bg-background/50 backdrop-blur px-3 py-1 rounded-full border border-border/50">
                        #TECH-{profile?.id?.substring(0, 4) || "000"} • {profile?.primarySkill || "Professional"}
                    </p>
                </div>
            </div>

            {/* Menu Options */}
            <main className="px-6 -mt-10 space-y-5 mx-auto max-w-md relative z-10">
                {/* Stats Row */}
                <section className="flex gap-3">
                    <div className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-2xl font-bold text-primary">142</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Jobs Done</p>
                    </div>
                    <div className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-2xl font-bold text-green-500">98%</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">On Time</p>
                    </div>
                    <div className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-2xl font-bold text-orange-500">12</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Streak</p>
                    </div>
                </section>

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
                        onClick={() => router.push("/technician/settings")}
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
                                <BiUser className="w-5 h-5" />
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

            <BottomNav active="profile" role="technician" />

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-3xl p-6 overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={editingData.name || ""}
                                onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                                placeholder="Enter your name"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="primarySkill">Primary Skill</Label>
                            <Input
                                id="primarySkill"
                                value={editingData.primarySkill || ""}
                                onChange={(e) => setEditingData({ ...editingData, primarySkill: e.target.value })}
                                placeholder="E.g. Electrical, Plumbing"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience (Years)</Label>
                            <Input
                                id="experience"
                                type="number"
                                value={editingData.experience || ""}
                                onChange={(e) => setEditingData({ ...editingData, experience: parseInt(e.target.value) })}
                                placeholder="Years of experience"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Service Area / Address</Label>
                            <Input
                                id="address"
                                value={editingData.address || ""}
                                onChange={(e) => setEditingData({ ...editingData, address: e.target.value })}
                                placeholder="City or specific area"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={editingData.dob || ""}
                                    onChange={(e) => setEditingData({ ...editingData, dob: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={editingData.gender || ""}
                                    onChange={(e) => setEditingData({ ...editingData, gender: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dailyRate">Daily Rate (₹)</Label>
                            <Input
                                id="dailyRate"
                                type="number"
                                value={editingData.dailyRate || ""}
                                onChange={(e) => setEditingData({ ...editingData, dailyRate: parseInt(e.target.value) })}
                                placeholder="800"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Bank Details</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        value={editingData.bankName || ""}
                                        onChange={(e) => setEditingData({ ...editingData, bankName: e.target.value })}
                                        placeholder="HDFC Bank"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountHolder">Account Holder</Label>
                                    <Input
                                        id="accountHolder"
                                        value={editingData.accountHolder || ""}
                                        onChange={(e) => setEditingData({ ...editingData, accountHolder: e.target.value })}
                                        placeholder="Name as in bank"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        value={editingData.accountNumber || ""}
                                        onChange={(e) => setEditingData({ ...editingData, accountNumber: e.target.value })}
                                        placeholder="00000000000"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ifsc">IFSC Code</Label>
                                        <Input
                                            id="ifsc"
                                            value={editingData.ifsc || ""}
                                            onChange={(e) => setEditingData({ ...editingData, ifsc: e.target.value.toUpperCase() })}
                                            placeholder="HDFC0000"
                                            className="rounded-xl uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="upi">UPI ID (Optional)</Label>
                                        <Input
                                            id="upi"
                                            value={editingData.upi || ""}
                                            onChange={(e) => setEditingData({ ...editingData, upi: e.target.value })}
                                            placeholder="user@upi"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-3 px-4 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateProfile}
                            disabled={updating}
                            className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {updating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : "Save Changes"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
