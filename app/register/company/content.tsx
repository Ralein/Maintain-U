"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { api } from "@/lib/api"
import { toast } from "sonner"

export default function CompanyRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    address: "",
    gst: "",
    email: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  })

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const res = await api.registerCompany({ phone, ...formData })
      if (res.success) {
        toast.success("Registration successful!")
        router.push("/company/dashboard")
      }
    } catch (e) {
      toast.error("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-20 bg-background">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Register Company</h1>
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-4 mb-8 animate-in slide-in-from-right-4 fade-in duration-300">
          <h2 className="text-lg font-bold text-foreground">Company Details</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Company Name"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <div className="relative">
              <select className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none font-medium">
                <option>Select Industry</option>
                <option>Manufacturing</option>
                <option>Textile</option>
                <option>Food & Beverage</option>
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
            <input
              type="text"
              placeholder="GST Number"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium uppercase placeholder:normal-case"
              value={formData.gst}
              onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-8 animate-in slide-in-from-right-4 fade-in duration-300">
          <h2 className="text-lg font-bold text-foreground">Primary Contact</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Contact Name"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 fixed bottom-8 left-6 right-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="py-3.5 px-6 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
        >
          Back
        </button>
        {step < 2 ? (
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
            {isLoading ? "Completing..." : "Complete Registration"}
          </button>
        )}
      </div>
    </div>
  )
}
