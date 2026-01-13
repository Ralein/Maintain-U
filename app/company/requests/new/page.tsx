"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
      }
    } catch (e) {
      toast.error("Failed to create request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">New Request</h1>
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-300">
          ✕
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all ${s <= step ? "bg-blue-500" : "bg-slate-700"}`}
          />
        ))}
      </div>

      {/* Step 1: Service Type */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Select Service Type</h2>
          <p className="text-slate-400 text-sm mb-6">What maintenance do you need?</p>

          <div className="space-y-3 mb-8">
            {[
              { id: "Electrical", label: "Electrical", icon: "⚡" },
              { id: "Mechanical", label: "Mechanical", icon: "⚙️" },
              { id: "Assembly", label: "Assembly", icon: "🔧" },
              { id: "HVAC", label: "HVAC", icon: "🌡️" },
              { id: "Plumbing", label: "Plumbing", icon: "🔩" },
            ].map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 w-full flex items-center gap-4 text-left transition-all ${formData.serviceType === service.id ? "bg-blue-500/30 border-blue-400/50" : "hover:bg-white/15"
                  }`}
              >
                <span className="text-3xl">{service.icon}</span>
                <span className="font-semibold text-white">{service.label}</span>
              </button>
            ))}
          </div>

          {/* Priority Selector */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-white mb-3 block">Priority Level</label>
            <div className="flex gap-3">
              {["Normal", "Urgent", "Emergency"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.priority === priority
                      ? priority === "Normal"
                        ? "backdrop-blur-md bg-green-500/30 border border-green-400/50 text-green-300"
                        : priority === "Urgent"
                          ? "backdrop-blur-md bg-yellow-500/30 border border-yellow-400/50 text-yellow-300"
                          : "backdrop-blur-md bg-red-500/30 border border-red-400/50 text-red-300"
                      : "backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 text-slate-300"
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
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Describe the Issue</h2>
          <p className="text-slate-400 text-sm mb-6">Provide details about what needs maintenance</p>

          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the maintenance issue in detail (min 50 characters)..."
            className="backdrop-blur-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all w-full h-32 resize-none mb-6"
          />

          <div className="mb-8">
            <label className="text-sm font-semibold text-white mb-3 block">Add Photos (Max 5)</label>
            <button className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl w-full py-8 flex flex-col items-center justify-center gap-3 hover:bg-white/15 transition-colors">
              <span className="text-4xl">📸</span>
              <span className="text-sm text-slate-400">Tap to add photos</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Schedule</h2>
          <p className="text-slate-400 text-sm mb-6">When do you need the service?</p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Preferred Date</label>
              <input
                type="date"
                className="backdrop-blur-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white w-full"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white mb-3 block">Time Slot</label>
              <div className="grid grid-cols-2 gap-3">
                {["Morning", "Afternoon", "Evening", "Flexible"].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setFormData({ ...formData, timeSlot: slot })}
                    className={`py-3 rounded-lg font-semibold transition-all ${formData.timeSlot === slot
                        ? "backdrop-blur-md bg-blue-500/30 border border-blue-400/50 text-blue-300"
                        : "backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 text-slate-300"
                      }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-white mb-2 block">Site Supervisor Name</label>
              <input
                type="text"
                placeholder="Full name"
                className="backdrop-blur-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all w-full mb-3"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              />
              <input
                type="tel"
                placeholder="+91 Phone number"
                className="backdrop-blur-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all w-full"
                value={formData.supervisorPhone}
                onChange={(e) => setFormData({ ...formData, supervisorPhone: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Review Your Request</h2>
          <p className="text-slate-400 text-sm mb-6">Confirm details before submission</p>

          <div className="space-y-4 mb-8">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5">
              <p className="text-xs text-slate-400 mb-1">Service Type</p>
              <p className="text-lg font-semibold text-white capitalize">{formData.serviceType}</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5">
              <p className="text-xs text-slate-400 mb-1">Priority</p>
              <p className="text-lg font-semibold text-white">{formData.priority}</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-white">{formData.description || "No description added"}</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5">
              <p className="text-xs text-slate-400 mb-1">Schedule</p>
              <p className="text-white">
                {formData.date && formData.timeSlot ? `${formData.date} - ${formData.timeSlot}` : "Not set"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 fixed bottom-6 left-6 right-6">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className="backdrop-blur-sm bg-white/5 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
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
            className="backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex-1 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            {isLoading ? "Submitting..." : "Submit Request"}
          </button>
        )}
      </div>
    </div>
  )
}
