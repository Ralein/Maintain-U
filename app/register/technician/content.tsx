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
    <div className="min-h-screen px-6 pt-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Register as Technician</h1>
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex gap-1 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold">Personal Details</h2>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          />
          <select
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option>Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input
            type="text"
            placeholder="Address"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold">Professional Details</h2>
          <input
            type="number"
            placeholder="Years of Experience"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          />
          <select
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
          <input
            type="number"
            placeholder="Daily Rate (₹)"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.dailyRate}
            onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold">Documents</h2>
          <button className="w-full py-6 px-4 rounded-lg border border-border hover:bg-muted transition-colors flex flex-col items-center gap-2">
            <span className="text-3xl">📄</span>
            <span className="text-sm text-muted-foreground">Upload Aadhar (Front)</span>
          </button>
          <button className="w-full py-6 px-4 rounded-lg border border-border hover:bg-muted transition-colors flex flex-col items-center gap-2">
            <span className="text-3xl">📄</span>
            <span className="text-sm text-muted-foreground">Upload Aadhar (Back)</span>
          </button>
          <button className="w-full py-6 px-4 rounded-lg border border-border hover:bg-muted transition-colors flex flex-col items-center gap-2">
            <span className="text-3xl">📄</span>
            <span className="text-sm text-muted-foreground">Upload PAN</span>
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold">Bank Details</h2>
          <input
            type="text"
            placeholder="Bank Name"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Account Holder Name"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.accountHolder}
            onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
          />
          <input
            type="text"
            placeholder="Account Number"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          />
          <input
            type="text"
            placeholder="IFSC Code"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.ifsc}
            onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
          />
          <input
            type="text"
            placeholder="UPI ID (Optional)"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={formData.upi}
            onChange={(e) => setFormData({ ...formData, upi: e.target.value })}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 fixed bottom-6 left-6 right-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="py-3 px-6 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  )
}
