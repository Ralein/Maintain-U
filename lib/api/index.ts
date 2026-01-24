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
  name?: string | null
  phone: string
  resetStatus?: "none" | "requested" | "approved"
  [key: string]: any
}

export interface Request {
  id: string
  companyId: string
  companyName: string
  serviceType: string
  priority: string
  description: string
  status: string
  preferredDate?: string
  timeSlot?: string
  date?: string // Keep for legacy/compat if needed, or remove? Better to map `preferredDate` to `date` in frontend if logic needs it, or update frontend. I updated frontend to use `date` property in some places?
  // Frontend `NewRequestPage` uses `date`. `actions.ts` maps `data.date` -> `preferredDate`.
  // `getRequestsAction` returns DB columns. So it will have `preferredDate`.
  // So I should add `preferredDate`.
  companyLocation?: string
  createdAt: number | Date
  [key: string]: any
}

export interface Job {
  id: string
  requestId: string
  technicianId: string | null
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
  async sendOTP(phone: string, role?: "company" | "technician") {
    const { sendOTPAction } = await import("@/lib/actions")
    return sendOTPAction(phone, role)
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
    const { logoutAction } = await import("@/lib/actions")
    return logoutAction()
  },

  async refreshSession() {
    const { refreshSessionAction } = await import("@/lib/actions")
    return refreshSessionAction()
  },

  async setPassword(password: string) {
    const { setPasswordAction } = await import("@/lib/actions")
    return setPasswordAction(password)
  },

  async loginWithPassword(phone: string, password: string, role?: "company" | "technician") {
    const { loginWithPasswordAction } = await import("@/lib/actions")
    return loginWithPasswordAction(phone, password, role)
  },

  async checkUserStatus(phone: string) {
    const { checkUserStatusAction } = await import("@/lib/actions")
    return checkUserStatusAction(phone)
  },

  // Company
  async registerCompany(data: any) {
    const { registerCompanyAction } = await import("@/lib/actions")
    return registerCompanyAction(data)
  },

  async getCompanyRequests(filters?: any) {
    const { getCompanyRequestsAction } = await import("@/lib/actions")
    return getCompanyRequestsAction()
  },

  async createRequest(data: any) {
    const { createRequestAction } = await import("@/lib/actions")
    return createRequestAction(data)
  },

  async getRequestById(id: string) {
    const { getRequestByIdAction } = await import("@/lib/actions")
    return getRequestByIdAction(id)
  },

  async deleteRequest(id: string) {
    const { deleteRequestAction } = await import("@/lib/actions")
    return deleteRequestAction(id)
  },

  // Job / Technician
  async registerTechnician(data: any) {
    const { registerTechnicianAction } = await import("@/lib/actions")
    return registerTechnicianAction(data)
  },

  async getJobs(filters?: any) {
    const { getJobsAction } = await import("@/lib/actions")
    return getJobsAction()
  },

  async getJobById(id: string) {
    const { getJobByIdAction } = await import("@/lib/actions")
    return getJobByIdAction(id)
  },

  async acceptJob(jobId: string) {
    const { acceptJobAction } = await import("@/lib/actions")
    return acceptJobAction(jobId)
  },

  async checkIn(jobId: string, location: any) {
    const { checkInAction } = await import("@/lib/actions")
    return checkInAction(jobId, location)
  },

  async updateJobStatus(jobId: string, status: string, notes?: string, photos?: string[]) {
    // We treating 'updateJobStatus' as posting an update message
    // If status change is needed, it's usually automatic via check-in/complete
    // But let's assume this is for 'Job Updates' (notes/photos)
    const { postJobUpdateAction } = await import("@/lib/actions")
    return postJobUpdateAction(jobId, notes || "Status update", photos || [])
  },

  async completeJob(jobId: string, signature: string) {
    const { completeJobAction } = await import("@/lib/actions")
    return completeJobAction(jobId, signature)
  },

  // Admin
  async getRequests(filters?: any) {
    const { getRequestsAction } = await import("@/lib/actions")
    return getRequestsAction()
  },

  async assignTeam(jobId: string, techIds: string[], leadId: string) {
    const { assignTeamAction } = await import("@/lib/actions")
    return assignTeamAction(jobId, techIds, leadId)
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

  async approvePasswordReset(userId: string) {
    const { approvePasswordResetAction } = await import("@/lib/actions")
    return approvePasswordResetAction(userId)
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

  async markAttendance(status: "present" | "leave") {
    const { markAttendanceAction } = await import("@/lib/actions")
    return markAttendanceAction(status)
  },

  async getTechnicianAttendance(month?: string) {
    const { getTechnicianAttendanceAction } = await import("@/lib/actions")
    return getTechnicianAttendanceAction(month)
  },

  async getSalaryData(period: string) {
    const { getSalaryDataAction } = await import("@/lib/actions")
    return getSalaryDataAction(period)
  },
}
