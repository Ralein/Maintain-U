"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Zap, Settings, Wrench, Thermometer, Droplet, X, Loader2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"

export default function NewRequestPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    serviceType: "",
    priority: "Normal",
    description: "",
    photos: [] as string[],
    date: "",
    timeSlot: "",
    supervisor: "",
    supervisorPhone: "",
  })

  const handleServiceSelect = (service: string) => {
    setFormData({ ...formData, serviceType: service })
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const res = await api.createRequest(formData)
      if (res.success) {
        toast.success("Request created successfully")
        router.push(`/company/requests/${res.id}`)
      } else {
        toast.error(res.message || "Failed to create request")
      }
    } catch (e) {
      toast.error("Failed to create request")
    } finally {
      setIsLoading(false)
    }
  }

  const serviceIcons: Record<string, React.ReactNode> = {
    Electrical: <Zap className="w-6 h-6" />,
    Mechanical: <Settings className="w-6 h-6" />,
    Assembly: <Wrench className="w-6 h-6" />,
    HVAC: <Thermometer className="w-6 h-6" />,
    Plumbing: <Droplet className="w-6 h-6" />,
  }

  return (
    <div className="min-h-screen pb-32 bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 px-6 py-4 glass border-b-0 flex items-center justify-between transition-all mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">New Request</h1>
          <p className="text-xs text-muted-foreground font-medium">Create maintenance ticket</p>
        </div>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center hover:bg-muted/80 rounded-xl transition-colors ring-1 ring-border/50 active:scale-95 bg-background/50 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <main className="px-6">
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? "bg-primary shadow-sm shadow-primary/30" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Step 1: Service Type */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold mb-1">Select Service Type</h2>
            <p className="text-muted-foreground text-sm mb-6">What maintenance do you need?</p>

            <div className="space-y-3 mb-8">
              {[
                { id: "Electrical", label: "Electrical" },
                { id: "Mechanical", label: "Mechanical" },
                { id: "Assembly", label: "Assembly" },
                { id: "HVAC", label: "HVAC" },
                { id: "Plumbing", label: "Plumbing" },
              ].map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service.id)}
                  className={`glass-card p-4 w-full flex items-center gap-4 text-left transition-all group ${formData.serviceType === service.id
                    ? "ring-2 ring-primary border-primary/50 bg-primary/5"
                    : "hover:border-primary/50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.serviceType === service.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground group-hover:text-primary"
                    }`}>
                    {serviceIcons[service.id]}
                  </div>
                  <span className="font-semibold">{service.label}</span>
                  {formData.serviceType === service.id && (
                    <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Priority Selector */}
            <div className="mb-8">
              <label className="text-sm font-semibold mb-3 block">Priority Level</label>
              <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border">
                {["Normal", "Urgent", "Emergency"].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${formData.priority === priority
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                      } ${formData.priority === priority && priority === "Urgent" ? "text-orange-600 dark:text-orange-400" : ""
                      } ${formData.priority === priority && priority === "Emergency" ? "text-red-600 dark:text-red-400" : ""
                      }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Description & Photos */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold mb-1">Describe the Issue</h2>
            <p className="text-muted-foreground text-sm mb-6">Provide details about what needs maintenance</p>

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the maintenance issue in detail (min 50 characters)..."
              className="w-full h-40 p-4 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none mb-6"
            />

            <div className="mb-8">
              <label className="text-sm font-semibold mb-3 block">Add Photo URLs</label>
              <textarea
                placeholder="Enter photo URLs (comma separated)..."
                className="w-full h-24 p-4 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none mb-2"
                onChange={(e) => setFormData({ ...formData, photos: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
              />
              <p className="text-xs text-muted-foreground">
                * Temporary: Enter direct image links (e.g. https://example.com/photo.jpg)
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold mb-1">Schedule</h2>
            <p className="text-muted-foreground text-sm mb-6">When do you need the service?</p>

            <div className="space-y-6 mb-8">
              <div>
                <label className="text-sm font-semibold mb-2 block">Preferred Date</label>
                <input
                  type="date"
                  className="w-full p-4 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block">Time Slot</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Morning", "Afternoon", "Evening", "Flexible"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: slot })}
                      className={`py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${formData.timeSlot === slot
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Site Supervisor</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full p-4 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="+91 Phone number"
                    className="w-full p-4 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.supervisorPhone}
                    onChange={(e) => setFormData({ ...formData, supervisorPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold mb-1">Review Request</h2>
            <p className="text-muted-foreground text-sm mb-6">Confirm details before submission</p>

            <div className="space-y-4 mb-8">
              <div className="glass-card p-5 rounded-2xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Service Type</p>
                <div className="flex items-center gap-2">
                  <div className="text-primary">{serviceIcons[formData.serviceType]}</div>
                  <p className="text-lg font-semibold capitalize">{formData.serviceType}</p>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Priority</p>
                <p className={`text-lg font-semibold ${formData.priority === 'Urgent' ? 'text-orange-600' :
                  formData.priority === 'Emergency' ? 'text-red-600' : ''
                  }`}>{formData.priority}</p>
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm leading-relaxed">{formData.description || "No description added"}</p>
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Schedule</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formData.date || "Date not set"}</p>
                    <p className="text-sm text-muted-foreground">{formData.timeSlot}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formData.supervisor || "No supervisor"}</p>
                    <p className="text-sm text-muted-foreground">{formData.supervisorPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="flex-1 py-4 px-6 rounded-xl border border-border font-semibold text-muted-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.serviceType) ||
                (step === 2 && formData.description.length < 50) ||
                (step === 3 && (!formData.date || !formData.timeSlot))
              }
              className="flex-[2] py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-[2] py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
