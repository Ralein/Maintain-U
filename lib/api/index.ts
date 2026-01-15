"use client"

// Mock API functions for MaintainU platform
// Using localStorage for persistence to simulate a real backend

const DELAY_MS = 800

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Types
export interface User {
  id: string
  role: "company" | "technician" | "admin"
  status: "pending" | "active" | "banned" | "rejected"
  name?: string
  phone: string
  [key: string]: any
}

export interface Request {
  id: string
  companyId: string
  companyName: string
  type: string
  priority: "Normal" | "Urgent" | "Emergency"
  description: string
  status: "New" | "Assigned" | "In Progress" | "Completed" | "Cancelled"
  date: string
  createdAt: number
  [key: string]: any
}

export interface Job {
  id: string
  requestId: string
  technicianId: string
  status: "Pending" | "Accepted" | "In Progress" | "Completed"
  [key: string]: any
}

// DB Helper
const DB = {
  get: (key: string) => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  },
  set: (key: string, data: any) => {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  },
  add: (key: string, item: any) => {
    const list = DB.get(key)
    list.unshift(item)
    DB.set(key, list)
    return item
  },
  update: (key: string, id: string, updates: any) => {
    const list = DB.get(key)
    const index = list.findIndex((i: any) => i.id === id)
    if (index !== -1) {
      list[index] = { ...list[index], ...updates }
      DB.set(key, list)
      return list[index]
    }
    return null
  },
}

// Initialize seed data if empty
if (typeof window !== "undefined") {
  if (!localStorage.getItem("requests")) {
    const initialRequests = [
      {
        id: "REQ-001",
        companyId: "COMP-001",
        companyName: "ABC Industries",
        type: "Electrical",
        priority: "Normal",
        status: "In Progress",
        date: "Jan 12, 2025",
        description: "Main circuit breaker tripping repeatedly",
        createdAt: Date.now() - 86400000,
      },
      {
        id: "REQ-002",
        companyId: "COMP-002",
        companyName: "XYZ Corp",
        type: "Mechanical",
        priority: "Urgent",
        status: "Completed",
        date: "Jan 10, 2025",
        description: "Conveyor belt stuck",
        createdAt: Date.now() - 172800000,
      },
    ]
    localStorage.setItem("requests", JSON.stringify(initialRequests))
  }
}

export const api = {
  // Auth
  async sendOTP(phone: string) {
    const { sendOTPAction } = await import("@/lib/actions")
    return sendOTPAction(phone)
  },

  async verifyOTP(phone: string, otp: string) {
    const { verifyOTPAction } = await import("@/lib/actions")
    return verifyOTPAction(phone, otp)
  },

  async getCurrentUser() {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("currentUser")
    return userStr ? JSON.parse(userStr) : null
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
    return { success: true }
  },

  // Company
  async registerCompany(data: any) {
    await delay(DELAY_MS)
    const user = { ...data, role: "company", id: `COMP-${Date.now()}` }
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user))
      // Could store in a 'users' collection too
    }
    return { success: true, user }
  },

  async getCompanyRequests(filters?: any) {
    await delay(DELAY_MS)
    const allRequests = DB.get("requests")
    // Filter logic could go here
    return { requests: allRequests }
  },

  async createRequest(data: any) {
    await delay(DELAY_MS)
    const newRequest = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      status: "New",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAt: Date.now(),
      ...data
    }
    DB.add("requests", newRequest)
    return { success: true, id: newRequest.id }
  },

  async getRequestById(id: string) {
    await delay(DELAY_MS)
    const requests = DB.get("requests")
    const req = requests.find((r: any) => r.id === id)
    return { request: req }
  },

  // Job / Technician
  async registerTechnician(data: any) {
    await delay(DELAY_MS)
    const user = { ...data, role: "technician", status: "pending", id: `TECH-${Date.now()}` }
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user))
      DB.add("technicians", user)
    }
    return { success: true, user }
  },

  async getJobs(filters?: any) {
    await delay(DELAY_MS)
    const requests = DB.get("requests")
    // Map assigned/active requests to jobs
    const dynamicJobs = requests
      .filter((r: any) => r.status !== 'New' && r.status !== 'Cancelled')
      .map((r: any) => ({
        id: r.id,
        requestId: r.id,
        technicianId: "TECH-MOCK-001", // Mock association
        company: r.companyName || r.companyId,
        service: r.type,
        status: r.status === 'Assigned' ? 'Pending' : r.status, // Map Request Status to Job Status
        location: "Mock Location", // We don't have location on request yet
        time: r.timeSlot || "09:00 AM",
        date: r.date
      }))

    const mockJobs = [
      {
        id: "JOB-001",
        requestId: "REQ-MOCK-001",
        technicianId: "TECH-MOCK-001",
        company: "ABC Industries",
        service: "Electrical",
        status: "Pending" as const,
        location: "Industrial Area, Phase 1",
        time: "09:00 AM",
        date: "Today"
      }
    ]

    return {
      jobs: [...dynamicJobs, ...mockJobs]
    }
  },

  async getJobById(id: string) {
    await delay(DELAY_MS)

    // Try to find in dynamic requests first
    const requests = DB.get("requests")
    const req = requests.find((r: any) => r.id === id)

    if (req) {
      return {
        job: {
          id: req.id,
          requestId: req.id,
          technicianId: "TECH-MOCK-001",
          company: req.companyName || req.companyId,
          address: "Mock Address",
          service: req.type,
          description: req.description,
          supervisor: req.supervisor || "N/A",
          supervisorPhone: req.supervisorPhone || "N/A",
          team: [
            { name: "Raj Kumar", role: "Lead", photo: "" }
          ],
          status: (req.status === 'Assigned' ? 'Pending' : req.status) as any
        }
      }
    }

    // Mock details fallback
    return {
      job: {
        id,
        requestId: "REQ-MOCK-001",
        technicianId: "TECH-MOCK-001",
        company: "ABC Industries",
        address: "Plot 45, Industrial Area, Phase 1",
        service: "Electrical",
        description: "Main circuit breaker tripping repeatedly. Urgent fix needed.",
        supervisor: "Mr. Sharma",
        supervisorPhone: "9876543200",
        team: [
          { name: "Raj Kumar", role: "Lead", photo: "" },
          { name: "Amit Singh", role: "Member", photo: "" }
        ],
        status: "In Progress" as "In Progress" | "Pending" | "Accepted" | "Completed"
      }
    }
  },

  async acceptJob(jobId: string) {
    await delay(DELAY_MS)
    return { success: true }
  },

  async checkIn(jobId: string, location: any) {
    await delay(DELAY_MS)
    return { success: true }
  },

  async updateJobStatus(jobId: string, status: string, notes?: string) {
    await delay(DELAY_MS)
    return { success: true }
  },

  async completeJob(jobId: string, signature: string) {
    await delay(DELAY_MS)
    return { success: true }
  },

  // Admin
  async getRequests(filters?: any) {
    await delay(DELAY_MS)
    const requests = DB.get("requests")
    return { requests }
  },

  async assignTeam(jobId: string, techIds: string[], leadId: string) {
    await delay(DELAY_MS)
    const requests = DB.get("requests")
    // Find request and simple update status
    // In real app, we would create a Job entry
    const reqIndex = requests.findIndex((r: any) => r.id === jobId)
    if (reqIndex >= 0) {
      DB.update("requests", jobId, { status: "Assigned" })
    }
    return { success: true }
  },

  async getTechnicians(filters?: string) {
    const { getTechniciansAction } = await import("@/lib/actions")
    return getTechniciansAction()
  },

  async getUsers() {
    const { getUsersAction } = await import("@/lib/actions")
    return getUsersAction()
  },

  async updateUserStatus(userId: string, status: "active" | "banned" | "pending" | "rejected", role?: string) {
    const { updateUserStatusAction } = await import("@/lib/actions")
    return updateUserStatusAction(userId, status, role)
  },

  async adminLogin(id: string, pass: string) {
    const { adminLoginAction } = await import("@/lib/actions")
    return adminLoginAction(id, pass)
  },

  async approveTechnician(techId: string) {
    // Legacy mock function - might need migration if using technicians table
    await delay(DELAY_MS)
    DB.update("technicians", techId, { status: "Active" })
    return { success: true }
  },

  async rejectTechnician(techId: string, reason: string) {
    // Legacy mock function
    await delay(DELAY_MS)
    DB.update("technicians", techId, { status: "Rejected", reason })
    return { success: true }
  },

  async getSalaryData(period: string) {
    await delay(DELAY_MS)
    return {
      technicians: [{ name: "Raj Kumar", days: 24, rate: 800, net: 19200 }],
    }
  },
}
