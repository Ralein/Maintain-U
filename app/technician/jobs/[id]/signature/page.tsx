"use client"

import type React from "react"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SignaturePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [supervisorName, setSupervisorName] = useState("")
  const [supervisorDesignation, setSupervisorDesignation] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "currentColor"
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const canvas = canvasRef.current
      const signature = canvas ? canvas.toDataURL() : ""

      await api.completeJob(params.id, signature)
      toast.success("Job completed successfully!")

      // Navigate to completion success or back to dashboard
      router.push("/technician/dashboard")
    } catch (e) {
      toast.error("Failed to submit job completion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-20">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2">Work Completion Sign-off</h1>
      <p className="text-muted-foreground text-sm mb-6">Supervisor to sign below</p>

      {/* Work Summary */}
      <div className="p-4 rounded-lg bg-card border border-border mb-6">
        <p className="text-xs text-muted-foreground mb-2">Job Summary</p>
        <p className="font-semibold mb-1">ABC Industries - Electrical Maintenance</p>
        <p className="text-sm text-muted-foreground">Duration: 2h 34m</p>
      </div>

      {/* Supervisor Info */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Supervisor Name"
          value={supervisorName}
          onChange={(e) => setSupervisorName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <input
          type="text"
          placeholder="Designation"
          value={supervisorDesignation}
          onChange={(e) => setSupervisorDesignation(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Signature Canvas */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-3">Signature</p>
        <canvas
          ref={canvasRef}
          width={320}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className="w-full border border-border rounded-lg bg-card cursor-crosshair"
        />
        <button
          onClick={clearSignature}
          className="w-full py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium mt-3"
        >
          Clear
        </button>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border mb-8 cursor-pointer hover:bg-muted/50 transition-colors">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-border cursor-pointer"
        />
        <span className="text-sm">I confirm that work has been completed satisfactorily</span>
      </label>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!supervisorName || !supervisorDesignation || !confirmed || loading}
        className="w-full py-4 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? "Submitting..." : "Submit Signature"}
      </button>
    </div>
  )
}
