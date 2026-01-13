"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

import { api } from "@/lib/api"
import { toast } from "sonner"

export default function TechnicianRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    address: "",
    experience: "",
    primarySkill: "",
    dailyRate: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    upi: ""
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const res = await api.registerTechnician({ phone, ...formData })
      if (res.success) {
        toast.success("Application submitted!")
        router.push("/technician/pending")
      }
    } catch (e) {
      toast.error("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-24 bg-background">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Register as Technician</h1>
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 mb-8 animate-in slide-in-from-right-4 fade-in duration-300">
          <h2 className="text-lg font-bold text-foreground">Personal Details</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="date"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-medium text-foreground bg-transparent"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <input
              type="text"
              placeholder="Address"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 mb-8 animate-in slide-in-from-right-4 fade-in duration-300">
          <h2 className="text-lg font-bold text-foreground">Professional Details</h2>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Years of Experience"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-medium"
                value={formData.primarySkill}
                onChange={(e) => setFormData({ ...formData, primarySkill: e.target.value })}
              >
                <option>Select Primary Skill</option>
                <option>Electrical</option>
                <option>Mechanical</option>
                <option>HVAC</option>
                <option>Plumbing</option>
                <option>Assembly</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <input
                type="number"
                placeholder="Daily Rate"
                className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 mb-8 animate-in slide-in-from-right-4 fade-in duration-300">
          <h2 className="text-lg font-bold text-foreground">Documents</h2>
          <div className="space-y-3">
            <button className="w-full py-6 px-4 rounded-xl border border-dashed border-border hover:bg-muted/50 hover:border-primary/50 transition-all flex flex-col items-center gap-2 group">
              <span className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Upload Aadhar (Front)</span>
            </button>
            <button className="w-full py-6 px-4 rounded-xl border border-dashed border-border hover:bg-muted/50 hover:border-primary/50 transition-all flex flex-col items-center gap-2 group">
              <span className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Upload Aadhar (Back)</span>
            </button>
            <button className="w-full py-6 px-4 rounded-xl border border-dashed border-border hover:bg-muted/50 hover:border-primary/50 transition-all flex flex-col items-center gap-2 group">
              <span className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <svg className="w-6 h-6 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Upload PAN</span>
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 mb-8 animate-in slide-in-from-right-4 fade-in duration-300">
          <h2 className="text-lg font-bold text-foreground">Bank Details</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Bank Name"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Account Holder Name"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
            />
            <input
              type="text"
              placeholder="Account Number"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="IFSC Code"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium uppercase placeholder:normal-case"
              value={formData.ifsc}
              onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
            />
            <input
              type="text"
              placeholder="UPI ID (Optional)"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.upi}
              onChange={(e) => setFormData({ ...formData, upi: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 fixed bottom-8 left-6 right-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="py-3.5 px-6 rounded-xl border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            {isLoading ? "Submitting..." : "Submit Application"}
          </button>
        )}
      </div>
    </div>
  )
}
