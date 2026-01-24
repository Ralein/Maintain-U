"use server"

import { db } from "@/lib/db"
import { users, companies, technicians, requests, jobs, attendance, jobUpdates, roleEnum, statusEnum, resetStatusEnum, masterTeams, masterTeamMembers, dailyAssignments, substitutions, invoices, payments, ratings, dailyAssignments as dailyAssignmentsTable } from "@/db/schema"
import { eq, or, and, desc, isNull, sql } from "drizzle-orm"
import { cookies } from "next/headers"

// Helper to simulate delay if requested, or just remove locally
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function sendOTPAction(phone: string, inputRole?: "company" | "technician") {
    // Check if user exists first
    const existingUsers = await db.select().from(users).where(eq(users.phone, phone)).limit(1)

    if (existingUsers.length > 0) {
        // User exists
        const user = existingUsers[0]

        // If pending, BLOCK OTP immediately but UPDATE ROLE if changed
        if (user.status === 'pending') {
            if (inputRole && inputRole !== user.role) {
                await db.update(users).set({ role: inputRole }).where(eq(users.id, user.id));
                user.role = inputRole; // Update local variable for session
            }

            // Refresh cookie just in case (optional, but good for redirection flow)
            (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });
            return { success: false, error: "pending", message: "Account pending verification" }
        }

        // Broaden the check for banned users
        if (user.status === 'banned') {
            return { success: false, error: "banned", message: "Account suspended" }
        }

        // Allow Rejected users to "Request Again" -> Reset to Pending (and update role if provided)
        if (user.status === 'rejected') {
            await db.update(users).set({ status: 'pending', ...(inputRole ? { role: inputRole } : {}) }).where(eq(users.id, user.id));
            (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: inputRole || user.role, status: 'pending' }), { httpOnly: true, path: '/' });
            return { success: false, error: "pending", message: "Account re-submitted for verification" }
        }
    } else {
        // New User - Create as Pending IMMEDIATELY (No OTP)
        // Check for specific mockup numbers if needed, but otherwise default to Pending
        let role: "company" | "technician" = inputRole || "company"
        let status: "pending" | "active" = "pending"

        // Mock Support
        if (phone === "9876543210") { role = "company"; status = "active"; }
        else if (phone === "9876543212") { role = "technician"; status = "active"; }
        else if (phone === "Raleinnova123" || phone === "9876543211" || phone === "9876543213") {
            // Admin flows handled in verify, but if they try to get OTP we can just let them pass or handle casually
            // For simplicity, let admins proceed to OTP step as they might be testing
            // BUT implementation plan said "skip OTP for new users". 
            // Admin isn't a "new user" in logic usually, but let's stick to the plan:
            // If it's the specific admin phone, we allow OTP flow so they can login.
        }

        if (status === 'pending') {
            const [newUser] = await db.insert(users).values({
                phone,
                role,
                status,
                name: "New User"
            }).returning();

            // Create session for pending user
            (await cookies()).set("session_token", JSON.stringify({ userId: newUser.id, role: newUser.role, status: newUser.status }), { httpOnly: true, path: '/' });

            return { success: false, error: "pending", message: "Account created, pending verification" }
        }
    }

    // Existing "Active" User or Special Mock gets OTP
    // In a real app, integrate SMS provider here (Twilio, SNS, etc.)
    return { success: true, message: "OTP sent" }
}

export async function verifyOTPAction(phone: string, otp: string) {
    // Mock Admin hardcodes (keeping as requested)
    if (phone === "Raleinnova123" || phone === "9876543211" || phone === "9876543213") {
        const adminId = phone === "Raleinnova123" ? "Raleinnova123" : phone;

        // Check if admin user exists, if not create
        const existingAdmin = await db.select().from(users).where(eq(users.phone, adminId)).limit(1);
        let user;

        if (existingAdmin.length === 0) {
            [user] = await db.insert(users).values({
                phone,
                role: "admin",
                status: "active",
                name: "Admin User"
            }).returning();
        } else {
            user = existingAdmin[0];
        }

        // Set Login Session (Cookie)
        (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role }), { httpOnly: true, path: '/' });

        return { success: true, role: "admin", user }
    }

    // Normal User Flow
    const existingUsers = await db.select().from(users).where(eq(users.phone, phone)).limit(1)

    if (existingUsers.length > 0) {
        const user = existingUsers[0];

        // Set Cookie FIRST so we track them
        (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });

        if (user.status === "pending") {
            return { success: false, error: "pending", message: "Account pending verification" }
        }
        if (user.status === "banned") {
            return { success: false, error: "banned", message: "Account suspended" }
        }
        if (user.status === "rejected") {
            return { success: false, error: "rejected", message: "Registration rejected" }
        }

        return { success: true, role: user.role as any, user }
    }

    // New User - Create as Pending
    let role: "company" | "technician" = "company"
    let status: "pending" | "active" = "pending"

    // Legacy Mock Support
    if (phone === "9876543210") { role = "company"; status = "active"; } // ABC Corp
    if (phone === "9876543212") { role = "technician"; status = "active"; } // Raj Kumar

    const [newUser] = await db.insert(users).values({
        phone,
        role,
        status,
        name: "New User"
    }).returning();

    // Create session even if pending
    (await cookies()).set("session_token", JSON.stringify({ userId: newUser.id, role: newUser.role, status: newUser.status }), { httpOnly: true, path: '/' });

    // New users (even if pending) should proceed to registration flow
    return { success: true, role, user: newUser }
}

export async function logoutAction() {
    (await cookies()).delete("session_token")
        ; (await cookies()).delete("admin_session")
    return { success: true }
}

export async function registerCompanyAction(data: any) {
    const cookieStore = await cookies()
    // Check if we have a session (from OTP verification)
    // In current flow, verifyOTP sets a cookie
    // But we might need to update that record with company details
    // OR if verifyOTP didn't create a user, create one now.

    // Strategy: Upsert based on phone number provided in data
    // Assuming 'phone' is passed in data

    const { phone, companyName, industry, address, gst, email, contactName } = data;

    if (!phone) return { success: false, message: "Phone number required" }

    // Check existing
    const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

    let user;
    if (existing.length > 0) {
        // Update existing user (who likely just did OTP)
        [user] = await db.update(users).set({
            role: 'company',
            status: 'pending', // Force pending
            name: companyName, // Use company name as main name
            profileCompleted: true
        }).where(eq(users.id, existing[0].id)).returning();
    } else {
        // Create new
        [user] = await db.insert(users).values({
            phone,
            role: 'company',
            status: 'pending',
            name: companyName,
            profileCompleted: true
        }).returning();
    }

    // Auto-create/Ensure Company Profile
    const existingProfile = await db.query.companies.findFirst({
        where: eq(companies.userId, user.id)
    })

    if (!existingProfile) {
        await db.insert(companies).values({
            userId: user.id,
            companyName: companyName,
            gstin: gst || "",
            address: address || "",
            industryType: industry || "General", // Default
            email: email,
            contactPerson: contactName
        })
    }

    // Set/Update session
    (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });

    return { success: true, user }
}

// Admin Actions

export async function getRequestsAction() {
    // Fetch all requests for admin with company details
    const result = await db.select({
        request: requests,
        company: companies
    })
        .from(requests)
        .leftJoin(companies, eq(requests.companyId, companies.id))
        .orderBy(desc(requests.createdAt));

    // Flatten structure for UI consumption
    const flattenedRequests = result.map(({ request, company }) => ({
        ...request,
        companyName: company?.companyName || "Unknown Company",
        companyLocation: company?.address,
    }));

    return { requests: flattenedRequests }
}

export async function getCompanyRequestsAction() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { requests: [] }

    const session = JSON.parse(sessionToken.value)

    const companyProfile = await db.query.companies.findFirst({
        where: eq(companies.userId, session.userId)
    })

    if (!companyProfile) return { requests: [] }

    const compRequests = await db.select().from(requests)
        .where(eq(requests.companyId, companyProfile.id))
        .orderBy(desc(requests.createdAt));

    const enrichedRequests = await Promise.all(compRequests.map(async (r) => {
        // Check for active jobs
        const associatedJobs = await db.select().from(jobs).where(eq(jobs.requestId, r.id));
        let effectiveStatus = r.status;
        const hasActiveJob = associatedJobs.some(j => j.status === 'In_Progress');

        if (hasActiveJob && r.status !== 'Completed' && r.status !== 'Cancelled') {
            effectiveStatus = 'In_Progress';
        }

        return {
            ...r,
            status: effectiveStatus,
            companyName: companyProfile.companyName,
            companyLocation: companyProfile.address || undefined,
            serviceType: r.serviceType || "General",
            preferredDate: r.preferredDate || undefined,
            timeSlot: r.timeSlot || undefined
        }
    }))

    return { requests: enrichedRequests }
}

export async function getTechniciansAction() {
    // Join users and technicians
    const result = await db.select({
        user: users,
        tech: technicians
    })
        .from(users)
        .leftJoin(technicians, eq(technicians.userId, users.id))
        .where(eq(users.role, 'technician'));

    const techsWithLocation = await Promise.all(result.map(async ({ user, tech }) => {
        let location = null;
        let lastSeen: string | null = null;

        if (tech) {
            const lastAttendance = await db.select().from(attendance)
                .where(eq(attendance.technicianId, tech.id))
                .orderBy(desc(attendance.createdAt))
                .limit(1);

            if (lastAttendance.length > 0) {
                if (lastAttendance[0].locationCheckIn) {
                    try {
                        location = JSON.parse(lastAttendance[0].locationCheckIn);
                    } catch (e) { }
                }
                lastSeen = lastAttendance[0].checkInTime ? new Date(lastAttendance[0].checkInTime).toISOString() : null
            }
        }

        // Mock locations for specific users if no real data (to simulate live map for demo)
        if (!location) {
            if (user.phone === "9876543212") location = { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" } // Raj
            else if (user.name?.includes("Amit")) location = { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" }
            else if (user.name?.includes("Sara")) location = { lat: 12.9352, lng: 77.6245, address: "Koramangala, Bangalore" }
        }

        const name = (user.name && user.name !== "New User") ? user.name : user.phone || "Unknown";

        return {
            id: user.id, // Use user ID for admin actions usually
            techId: tech?.id,
            name: name,
            skill: tech?.primarySkill || "General",
            rating: tech?.rating || "0",
            status: (tech?.status || user.status) === 'active' ? 'Available' : (tech?.status || user.status),
            phone: user.phone,
            experience: tech?.experience,
            joinedAt: user.createdAt,
            lat: location?.lat || null,
            lng: location?.lng || null,
            locationName: location?.address || "Unknown Location",
            lastSeen
        }
    }))

    return {
        technicians: techsWithLocation
    }
}

export async function getUsersAction() {
    const allUsers = await db.select().from(users).orderBy(users.createdAt)
    return { users: allUsers }
}

export async function updateUserStatusAction(userId: string, status: "pending" | "active" | "banned" | "rejected", role?: string) {
    await db.update(users)
        .set({
            status,
            ...(role ? { role: role as any } : {})
        })
        .where(eq(users.id, userId))

    return { success: true }
}

// Admin Login Specific Action (for critical admin access)
// Admin Login Specific Action (for critical admin access)
export async function adminLoginAction(id: string, pass: string) {
    // Hidden Credentials & Hashing
    // ID Hash for "Ralein Nova"
    const ADMIN_ID_HASH = "1ff4fdba848a3fb50cd945579ec3683a5162d4d93903f4af948f6a151acb2d10";
    // Pass Hash for "Raleinnova12345"
    const ADMIN_PASS_HASH = "287b1be1a9ee154f81093ae64d189dab44d8519ecb1fd9404420cc5c267eedf6";

    // Server-side crypto check
    const { createHash } = await import("crypto");
    // Trim input ID to handle copy-paste whitespace
    const cleanId = id.trim();

    // Hash both inputs
    const idHash = createHash("sha256").update(cleanId).digest("hex");
    const passHash = createHash("sha256").update(pass).digest("hex");

    console.log("Admin Login Attempt Hash Check:", { match: idHash === ADMIN_ID_HASH });

    if (idHash === ADMIN_ID_HASH && passHash === ADMIN_PASS_HASH) {
        console.log("Credentials Valid. Checking DB...");
        try {
            // Check if admin user exists in DB for reference, or just ensure session
            // We can upsert a record for "Ralein Nova" if we want to track actions
            // We can upsert a record for "Ralein Nova" if we want to track actions
            let user = await db.query.users.findFirst({
                where: eq(users.phone, "admin-ralein-nova") // Internal ID mapping
            });

            if (!user) {
                console.log("Creating new admin user record...");
                [user] = await db.insert(users).values({
                    phone: "admin-ralein-nova",
                    role: "admin",
                    status: "active",
                    name: "Ralein Nova"
                }).returning();
            }

            console.log("Setting session cookies...");
            // Secure Session
            (await cookies()).set("admin_session", "true", { httpOnly: true, path: '/' });
            // Also set regular session for consistency if needed
            (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: "admin" }), { httpOnly: true, path: '/' });

            return { success: true, role: "admin", user };
        } catch (err) {
            console.error("Admin Login DB/Cookie Error:", err);
            return { success: false, message: "System Error during login processing" };
        }
    } else {
        console.log("Invalid Credentials");
    }

    return { success: false, message: "Invalid Administration ID or Password" };
}

export async function refreshSessionAction() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")

    if (!sessionToken) return { success: false }

    try {
        const session = JSON.parse(sessionToken.value)
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.userId)
        })

        if (!user) return { success: false }

        // Sync cookie if status changed
        if (user.status !== session.status) {
            (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });
        }

        return {
            success: true,
            status: user.status,
            role: user.role,
            name: user.name,
            phone: user.phone,
            hasPassword: !!user.passwordHash,
            resetStatus: user.resetStatus
        }
    } catch (e) {
        return { success: false }
    }
}

// Password Authentication Actions
export async function setPasswordAction(password: string) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")

    if (!sessionToken) {
        return { success: false, message: "Not authenticated" }
    }

    try {
        const session = JSON.parse(sessionToken.value)
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.userId)
        })

        if (!user) {
            return { success: false, message: "User not found" }
        }

        if (user.status !== 'active') {
            return { success: false, message: "Account not verified yet" }
        }

        // Validate password
        if (!password || password.length < 8) {
            return { success: false, message: "Password must be at least 8 characters" }
        }

        // Hash password
        const { createHash } = await import("crypto")
        const passwordHash = createHash("sha256").update(password).digest("hex")

        // Update user with password
        await db.update(users)
            .set({
                passwordHash,
                resetStatus: 'none', // Clear reset status
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id))

        return { success: true, message: "Password set successfully" }
    } catch (e) {
        console.error("Set password error:", e)
        return { success: false, message: "Failed to set password" }
    }
}

// Updated signature to accept inputRole
export async function loginWithPasswordAction(phone: string, password: string, inputRole?: "company" | "technician") {
    try {
        // Find user by phone
        const user = await db.query.users.findFirst({
            where: eq(users.phone, phone)
        })

        if (!user) {
            return { success: false, error: 'not_found', message: "Account not found. Please sign up." }
        }

        // Check status
        if (user.status === 'pending') {
            // Update intent if role mismatch
            if (inputRole && inputRole !== user.role) {
                await db.update(users).set({ role: inputRole }).where(eq(users.id, user.id));
                user.role = inputRole;
            }

            // Set session for pending user to enable polling
            (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });
            return { success: false, error: 'pending', message: "Account pending verification" }
        }

        if (user.status === 'banned') {
            return { success: false, error: 'banned', message: "Account suspended" }
        }

        if (user.status === 'rejected') {
            return { success: false, error: 'rejected', message: "Registration rejected. Please contact support." }
        }

        // Check if user has set a password
        if (!user.passwordHash) {
            // User is active but hasn't set password yet - set session and redirect to password setup
            (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });
            return { success: false, error: 'no_password', message: "Please set up your password" }
        }

        // Verify password
        const { createHash } = await import("crypto")
        const passwordHash = createHash("sha256").update(password).digest("hex")

        if (passwordHash !== user.passwordHash) {
            return { success: false, message: "Invalid password" }
        }

        // Success - set session
        (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });

        // Check profile completion
        if (!user.profileCompleted) {
            return {
                success: false,
                error: 'profile_incomplete',
                role: user.role,
                message: "Please complete your profile configuration"
            }
        }

        return {
            success: true,
            role: user.role,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role
            }
        }
    } catch (e) {
        console.error("Login error:", e)
        return { success: false, message: "Login failed. Please try again." }
    }
}

export async function checkUserStatusAction(phone: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.phone, phone)
    })

    if (!user) {
        return { exists: false }
    }

    return {
        exists: true,
        status: user.status,
        role: user.role,
        hasPassword: !!user.passwordHash
    }
}

export async function requestPasswordResetAction(phone: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.phone, phone)
    })

    if (!user) {
        return { success: false, message: "Account not found" }
    }

    if (user.status !== 'active') {
        return { success: false, message: "Account not active. Cannot reset password." }
    }

    await db.update(users)
        .set({ resetStatus: 'requested' })
        .where(eq(users.id, user.id))

    return { success: true, message: "Request sent to admin" }
}

export async function checkResetStatusAction(phone: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.phone, phone)
    })

    if (!user) return { success: false, message: "User not found" }

    return {
        success: true,
        resetStatus: user.resetStatus,
        userId: user.id
    }
}

export async function approvePasswordResetAction(userId: string) {
    await db.update(users)
        .set({ resetStatus: 'approved' })
        .where(eq(users.id, userId))

    return { success: true }
}

export async function loginWithResetApprovalAction(phone: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.phone, phone)
    })

    if (!user) return { success: false, message: "User not found" }

    if (user.resetStatus !== 'approved') {
        return { success: false, message: "Reset not approved" }
    }

    // Create session
    (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });

    return { success: true }
}

export async function completePasswordResetAction(phone: string, password: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.phone, phone)
    })

    if (!user) {
        return { success: false, message: "Account not found" }
    }

    if (user.resetStatus !== 'approved') {
        return { success: false, message: "Reset request not approved yet" }
    }

    // Hash password
    const { createHash } = await import("crypto")
    const passwordHash = createHash("sha256").update(password).digest("hex")

    await db.update(users)
        .set({
            passwordHash,
            resetStatus: 'none',
            updatedAt: new Date()
        })
        .where(eq(users.id, user.id))

    return { success: true, message: "Password reset successfully" }
}

export async function getResetRequestsAction() {
    const resetRequests = await db.select().from(users).where(eq(users.resetStatus, 'requested'));
    return { requests: resetRequests }
}

export async function getTechnicianProfileAction() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { success: false }
    const session = JSON.parse(sessionToken.value)

    const tech = await db.query.technicians.findFirst({
        where: eq(technicians.userId, session.userId)
    })

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId)
    })

    if (!tech || !user) return { success: false }

    return {
        success: true,
        data: {
            ...tech,
            name: user.name,
            phone: user.phone
        }
    }
}

export async function getCompanyProfileAction() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { success: false }
    const session = JSON.parse(sessionToken.value)

    const company = await db.query.companies.findFirst({
        where: eq(companies.userId, session.userId)
    })

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId)
    })

    if (!company || !user) return { success: false }

    return {
        success: true,
        data: {
            ...company,
            phone: user.phone,
            email: company.email || "admin@company.com",
            subscription: "Pro Plan" // Placeholder to satisfy the requirements of the tool (content handles in multi_replace)
        }
    }
}

// Service Request Actions
export async function createRequestAction(data: any) {
    console.log("createRequestAction called with:", JSON.stringify(data, null, 2))
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")

    if (!sessionToken) {
        console.log("createRequestAction failed: No session token")
        return { success: false, message: "Not authenticated" }
    }

    const session = JSON.parse(sessionToken.value)
    console.log("createRequestAction session:", JSON.stringify(session, null, 2))

    if (session.role !== 'company') {
        console.log("createRequestAction failed: Role mismatch. Expected 'company', got:", session.role)
        return { success: false, message: "Only companies can create requests" }
    }

    // Get company details (first check companies table for profile)
    const companyProfile = await db.query.companies.findFirst({
        where: eq(companies.userId, session.userId)
    })

    const companyUser = await db.query.users.findFirst({
        where: eq(users.id, session.userId)
    })

    if (!companyUser) {
        console.log("createRequestAction failed: User not found in database. userId:", session.userId)
        return { success: false, message: "User not found" }
    }

    if (!companyProfile) {
        return { success: false, message: "Company profile not found" }
    }

    try {
        const [newReq] = await db.insert(requests).values({
            companyId: companyProfile.id,
            priority: data.priority,
            description: data.description,
            serviceType: data.serviceType,
            timeSlot: data.timeSlot,
            preferredDate: data.date, // schema has preferredDate, data has date
            supervisorName: data.supervisor,
            supervisorPhone: data.supervisorPhone,
            photos: data.photos || [],
            status: "Requested"
        }).returning();

        return { success: true, id: newReq.id }
    } catch (e: any) {
        console.error("Create request error:", e)
        return { success: false, message: `Failed to create request: ${e.message || JSON.stringify(e)}` }
    }
}

// Technician Registration Action


export async function registerTechnicianAction(data: any) {
    const { phone, ...techData } = data;

    // 1. Ensure User Exists (should have been created during OTP or checks)
    let user = await db.query.users.findFirst({
        where: eq(users.phone, phone)
    })

    if (!user) {
        // Fallback: create user if not exists (edge case)
        [user] = await db.insert(users).values({
            phone,
            role: 'technician',
            status: 'pending',
            name: techData.name
        }).returning();

        // Auto-create profile immediately
        await db.insert(technicians).values({
            userId: user.id
        })
    } else {
        // Update name
        await db.update(users).set({
            name: techData.name,
            role: 'technician' // Ensure role is set
        }).where(eq(users.id, user.id));
    }

    try {
        // 2. Create/Update Technician Profile
        // Check if profile exists
        const existingTech = await db.query.technicians.findFirst({
            where: eq(technicians.userId, user.id)
        })

        if (existingTech) {
            // Update
            await db.update(technicians).set({
                dob: techData.dob,
                gender: techData.gender,
                address: techData.address,
                experience: parseInt(techData.experience),
                primarySkill: techData.primarySkill,
                skills: [techData.primarySkill], // Initialize with primary
                dailyRate: parseInt(techData.dailyRate),
                bankDetails: {
                    bankName: techData.bankName,
                    accountHolder: techData.accountHolder,
                    accountNumber: techData.accountNumber,
                    ifsc: techData.ifsc,
                    upi: techData.upi
                },
                // documents would be handled here if we had them
                updatedAt: new Date()
            } as any).where(eq(technicians.id, existingTech.id));
        } else {
            // Create
            await db.insert(technicians).values({
                userId: user.id,
                dob: techData.dob,
                gender: techData.gender,
                address: techData.address,
                experience: parseInt(techData.experience),
                primarySkill: techData.primarySkill,
                skills: [techData.primarySkill],
                dailyRate: parseInt(techData.dailyRate || "800"), // Default rate
                bankDetails: {
                    bankName: techData.bankName,
                    accountHolder: techData.accountHolder,
                    accountNumber: techData.accountNumber,
                    ifsc: techData.ifsc,
                    upi: techData.upi
                },
                status: 'pending' // Default to pending until approved
            } as any)
        }

        return { success: true, user }

    } catch (e: any) {
        console.error("Register Technician Error:", e)
        return { success: false, message: e.message || "Registration failed" }
    }
}

// Job Actions

export async function getJobsAction() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { jobs: [] }

    const session = JSON.parse(sessionToken.value)

    // If technician, fetch available (pending) OR assigned to them
    if (session.role === 'technician') {
        const [tech] = await db.select({ id: technicians.id }).from(technicians)
            .where(eq(technicians.userId, session.userId))
            .limit(1)

        if (!tech) return { jobs: [] }

        // Fetch jobs assigned to this technician
        const myJobs = await db.select({
            id: jobs.id,
            company: companies.companyName,
            service: requests.serviceType, // Changed from requests.type to requests.serviceType
            location: sql<string>`'Client Location'`, // Placeholder as requests doesn't have address. Could join companies if needed.
            status: jobs.status,
            date: requests.preferredDate, // Changed from requests.date to requests.preferredDate
            requestId: jobs.requestId
        })
            .from(jobs)
            .leftJoin(requests, eq(jobs.requestId, requests.id))
            .leftJoin(companies, eq(requests.companyId, companies.id)) // Join request creator company
            .where(eq(jobs.leadTechnicianId, tech.id))

        // Also fetch "Invitations" - Jobs that are "Pending" and match tech skill? 
        // OR logic: System assigns to tech -> status 'Pending' -> Tech accepts -> 'Active'
        // Let's assume 'Pending' jobs assigned to techId are invitations.

        return { jobs: myJobs }
    }

    // If Admin, fetch all jobs
    if (session.role === 'admin' || session.role === 'company') {
        const result = await db.select({
            id: jobs.id,
            company: companies.companyName,
            service: requests.serviceType,
            location: sql<string>`'Address Placeholder'`,
            status: jobs.status,
            date: requests.preferredDate,
            requestId: jobs.requestId
        })
            .from(jobs)
            .leftJoin(requests, eq(jobs.requestId, requests.id))
            .leftJoin(companies, eq(requests.companyId, companies.id))
            .orderBy(desc(jobs.createdAt));

        return { jobs: result }
    }

    return { jobs: [] }
}

// Attendance Actions
export async function markAttendanceAction(status: "present" | "leave") {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { success: false, message: "Not authenticated" }

    const session = JSON.parse(sessionToken.value)

    const tech = await db.query.technicians.findFirst({
        where: eq(technicians.userId, session.userId)
    })

    if (!tech) return { success: false, message: "Technician profile not found" }

    const today = new Date().toISOString().split('T')[0]

    // Find assignment for today
    const assignment = await db.query.dailyAssignments.findFirst({
        where: and(
            eq(dailyAssignments.workDate, today),
            // We need to link assignment to tech. But assignment is Team logic.
            // Simplified: Find assignment where tech is member of MasterTeam? 
            // Or just allow tech to check in if they have a Job?
            // Architecture: Admin assigns Daily Team.
            // Since we don't have DailyTeamMembers table yet (implied by Assignment -> Attendance),
            // We just let them check in if they have a Job in 'In_Progress' or similar?
            // Or just CREATE an attendance record freely?
            // Best: Find ANY Active assignment for a Job they are lead of?
        )
    })

    // Fallback: Just insert attendance if they are checking in. 
    // BUT we need dailyAssignmentId.
    // Let's find existing attendance or Create Ad-hoc assignment?
    // Since Check-In on Job Page handles job-specific attendance,
    // this global action is vague. Let's redirect them to use Job Check-in.
    return { success: false, message: "Use the Check-In button on your Job details page." }
}

export async function getTechnicianAttendanceAction(month?: string) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { success: false, data: [] }

    const session = JSON.parse(sessionToken.value)

    const tech = await db.query.technicians.findFirst({
        where: eq(technicians.userId, session.userId)
    })

    if (!tech) return { success: false, data: [] }

    const records = await db.select().from(attendance)
        .where(eq(attendance.technicianId, tech.id))
        .orderBy(desc(attendance.createdAt))

    return { success: true, data: records }
}

// Salary Actions
export async function getSalaryDataAction(period: string) {
    // 1. Get all active technicians
    const allTechs = await db.select({
        id: technicians.id,
        userId: users.id,
        name: users.name,
        dailyRate: technicians.dailyRate,
        status: technicians.status
    })
        .from(technicians)
        .leftJoin(users, eq(users.id, technicians.userId))
        .where(eq(technicians.status, 'active'))

    // 2. Calculate stats for each
    const salaryData = await Promise.all(allTechs.map(async (tech) => {
        const attendanceRecords = await db.select().from(attendance)
            .where(
                and(
                    eq(attendance.technicianId, tech.id),
                    eq(attendance.status, 'present')
                )
            )

        const daysPresent = attendanceRecords.length;
        const rate = tech.dailyRate || 800;
        const net = daysPresent * rate;

        return {
            id: tech.id,
            name: tech.name || "Unknown",
            days: daysPresent,
            substituted: 0,
            netDays: daysPresent,
            rate: rate,
            deductions: 0,
            net: net
        }
    }))

    return {
        technicians: salaryData,
        summary: {
            totalPayable: salaryData.reduce((acc, curr) => acc + curr.net, 0),
            totalTechs: salaryData.length,
            totalWorkDays: salaryData.reduce((acc, curr) => acc + curr.days, 0)
        }
    }
}

export async function getRequestByIdAction(id: string) {
    const result = await db.select({
        request: requests,
        company: companies
    })
        .from(requests)
        .leftJoin(companies, eq(requests.companyId, companies.id))
        .where(eq(requests.id, id))
        .limit(1)

    if (result.length === 0) return { request: null }

    const { request, company } = result[0];

    // Fetch associated jobs to determine effective status
    const associatedJobs = await db.select().from(jobs).where(eq(jobs.requestId, id));
    let effectiveStatus = request.status;

    // If any job is In_Progress (and Request is not Completed/Cancelled), show In_Progress
    const hasActiveJob = associatedJobs.some(j => j.status === 'In_Progress');
    if (hasActiveJob && request.status !== 'Completed' && request.status !== 'Cancelled') {
        effectiveStatus = 'In_Progress';
    }

    return {
        request: {
            ...request,
            status: effectiveStatus,
            // fix: ensure null values become undefined to match Request interface
            preferredDate: request.preferredDate || undefined,
            timeSlot: request.timeSlot || undefined,
            serviceType: request.serviceType || "General",
            companyName: company?.companyName || "Unknown Company",
            companyLocation: company?.address || undefined,
        }
    }
}

export async function deleteRequestAction(id: string) {
    try {
        // Delete associated jobs first
        await db.delete(jobs).where(eq(jobs.requestId, id))
        // Delete request
        await db.delete(requests).where(eq(requests.id, id))
        return { success: true }
    } catch (error) {
        console.error("Delete request error:", error)
        return { success: false, message: "Failed to delete request" }
    }
}

export async function assignTeamAction(requestId: string, techIds: string[], leadId: string) {
    if (!requestId || !techIds.length) {
        return { success: false, message: "Invalid assignment data" }
    }

    try {
        await db.update(requests)
            .set({ status: 'Team_Confirmed' })
            .where(eq(requests.id, requestId));

        // 2. Create Job Entries for each technician
        // Check if jobs already exist for this request to prevent duplicates? 
        // For simplicity, we assume fresh assignment or just insert.

        // Note: techIds from UI are likely userIds or technicianIds. 
        // If they are userIds, we need to resolve to technicianIds?
        // In getTechniciansAction we return { id: user.id, techId: tech.id }
        // The UI uses `tech.id` which is user.id in the mapping: `id: user.id`.
        // Wait, let's check getTechniciansAction mapping:
        // id: user.id
        // techId: tech.id
        // The UI (AssignTeamPage) uses `tech.id` as the key.
        // So `techIds` array contains USER IDs.
        // BUT `jobs` table `technicianId` references `technicians.id`.
        // So we need to resolve User IDs to Technician IDs.

        // Resolve User IDs to Technician IDs (and auto-create profiles if missing)
        const resolvedJobValues: any[] = [];
        for (const uid of techIds) {
            let tech = await db.query.technicians.findFirst({
                where: eq(technicians.userId, uid)
            })

            if (!tech) {
                // Auto-create tech profile for this user
                // Get user phone for better naming if needed, but we only have uid here.
                // Best to query user first? Or just let it be. 
                // Wait, we need to ensure the USER record has a good name too if it was "New User"?
                // Let's at least get the user details to set a name if we can.
                const user = await db.query.users.findFirst({ where: eq(users.id, uid) });

                // If user name is New User, update it to Phone
                if (user && (user.name === "New User" || !user.name)) {
                    await db.update(users).set({ name: user.phone }).where(eq(users.id, uid));
                }

                [tech] = await db.insert(technicians).values({
                    userId: uid,
                    status: 'active',
                    primarySkill: 'General',
                    skills: ['General'],
                    experience: 0,
                    dailyRate: 800
                }).returning();
            }

            resolvedJobValues.push({
                requestId,
                leadTechnicianId: tech.id,
                status: 'Team_Confirmed',
            });
        }

        if (resolvedJobValues.length > 0) {
            await db.insert(jobs).values(resolvedJobValues);
        }

        return { success: true }
    } catch (e) {
        console.error("Assign team error:", e)
        return { success: false, message: "Failed to assign team" }
    }
}



export async function getJobByIdAction(id: string) {
    const result = await db.select({
        job: jobs,
        req: requests,
        comp: companies
    })
        .from(jobs)
        .innerJoin(requests, eq(jobs.requestId, requests.id))
        .leftJoin(companies, eq(requests.companyId, companies.id))
        .where(eq(jobs.id, id))
        .limit(1);

    if (result.length === 0) return { job: null }

    const { job, req, comp } = result[0];

    return {
        job: {
            id: job.id,
            requestId: req.id,
            technicianId: job.leadTechnicianId, // Map DB leadTechnicianId to API technicianId
            company: comp?.companyName || "Unknown Company",
            address: comp?.address || "Address Placeholder",
            service: req.serviceType, // Changed from req.type to req.serviceType
            description: req.description,
            supervisor: req.supervisorName, // Changed from req.supervisor to req.supervisorName
            supervisorPhone: req.supervisorPhone,
            team: [],
            status: job.status
        }
    }
}

// Daily Operations
// Imports should be at top, but for now we rely on them being available or auto-imported by context if I moved them. 
// Actually I need to add them to top. 

export async function acceptJobAction(jobId: string) {
    try {
        await db.update(jobs)
            .set({ status: 'Team_Confirmed', updatedAt: new Date() })
            .where(eq(jobs.id, jobId));

        return { success: true }
    } catch (e) {
        return { success: false, message: "Failed to accept job" }
    }
}

export async function checkInAction(jobId: string, location: any) {
    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
    if (!job) return { success: false, message: "Job not found" }

    try {
        // Simplified Check-in Logic adapting to new schema
        // 1. Ensure DailyAssignment exists for today
        // 2. Insert attendance record linked to assignment

        const todayStr = new Date().toISOString().split('T')[0];

        let assignment = await db.query.dailyAssignments.findFirst({
            where: and(
                eq(dailyAssignments.jobId, jobId),
                eq(dailyAssignments.workDate, todayStr)
            )
        });

        if (!assignment) {
            [assignment] = await db.insert(dailyAssignments).values({
                jobId,
                workDate: todayStr,
                status: "Active"
            }).returning();
        }

        // Check for open session
        const openSession = await db.select().from(attendance)
            .where(and(
                eq(attendance.dailyAssignmentId, assignment.id),
                eq(attendance.technicianId, job.leadTechnicianId!), // Assuming Lead Tech for now
                isNull(attendance.checkOutTime)
            ))
            .limit(1);

        if (openSession.length > 0) {
            await db.update(attendance)
                .set({ locationCheckIn: JSON.stringify(location) })
                .where(eq(attendance.id, openSession[0].id));
            return { success: true, message: "Location updated" }
        }

        // New Check-in
        await db.insert(attendance).values({
            dailyAssignmentId: assignment.id,
            technicianId: job.leadTechnicianId!,
            checkInTime: new Date(),
            locationCheckIn: JSON.stringify(location),
            status: 'Present'
        })

        // Update Job status
        await db.update(jobs)
            .set({ status: "In_Progress", startedAt: new Date() })
            .where(eq(jobs.id, jobId));

        // Sync Request Status to In_Progress
        if (job.requestId) {
            await db.update(requests)
                .set({ status: "In_Progress" })
                .where(eq(requests.id, job.requestId));
        }

        return { success: true }
    } catch (e: any) {
        console.error("Check-in error:", e)
        return { success: false, message: e.message || "Failed to check in" }
    }
}

export async function postJobUpdateAction(jobId: string, message: string, photos: string[]) {
    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
    if (!job) return { success: false }

    try {
        await db.insert(jobUpdates).values({
            jobId,
            technicianId: job.leadTechnicianId!, // Fixed: Use leadTechnicianId
            type: 'update', // Added missing 'type'
            message,
            photos,
        })
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}

export async function completeJobAction(jobId: string, signature: string) {
    try {
        await db.update(jobs)
            .set({
                status: "Completed", // requestStatusEnum 'Completed'
                completedAt: new Date(),
                signatureUrl: signature // Changed from signature to signatureUrl
            })
            .where(eq(jobs.id, jobId));

        // Also ensure check-out if not done? 
        // For simplicity, we assume check-out is separate or auto-done.
        // Let's find open attendance for today and close it.
        const today = new Date().toISOString().split('T')[0];
        const assignment = await db.query.dailyAssignments.findFirst({
            where: and(
                eq(dailyAssignments.jobId, jobId),
                eq(dailyAssignments.workDate, today)
            )
        })

        if (assignment) {
            const openAttendance = await db.query.attendance.findFirst({
                where: and(
                    eq(attendance.dailyAssignmentId, assignment.id),
                    isNull(attendance.checkOutTime)
                )
            })

            if (openAttendance) {
                await db.update(attendance)
                    .set({ checkOutTime: new Date() })
                    .where(eq(attendance.id, openAttendance.id));
            }
        }

        // Check if all jobs for this request are completed
        const jobRecord = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId)
        })

        if (jobRecord && jobRecord.requestId) {
            const allJobs = await db.select().from(jobs).where(eq(jobs.requestId, jobRecord.requestId))
            const reallyAllCompleted = allJobs.every(j => j.status === 'Completed')

            if (reallyAllCompleted) {
                await db.update(requests)
                    .set({ status: "Completed" })
                    .where(eq(requests.id, jobRecord.requestId));
            }
        }

        return { success: true }
    } catch (e) {
        return { success: false, message: "Failed to complete job" }
    }
}

// Profile Completion Actions

export async function completeCompanyProfileAction(data: { companyName: string, gstin?: string, address: string, contactPerson: string, email?: string }) {
    try {
        const cookiesList = await cookies()
        const sessionToken = cookiesList.get("session_token")?.value
        if (!sessionToken) return { success: false, message: "Unauthorized" }

        const session = JSON.parse(sessionToken)
        const userId = session.userId

        if (!data.gstin) {
            return { success: false, message: "GSTIN is required" }
        }

        // Check if company record exists (upsert)
        const existingCompany = await db.query.companies.findFirst({ where: eq(companies.userId, userId) })

        if (existingCompany) {
            await db.update(companies).set({
                companyName: data.companyName,
                gstin: data.gstin,
                address: data.address,
                contactPerson: data.contactPerson,
                email: data.email,
                updatedAt: new Date()
            }).where(eq(companies.id, existingCompany.id))
        } else {
            await db.insert(companies).values({
                userId,
                companyName: data.companyName,
                gstin: data.gstin,
                address: data.address,
                contactPerson: data.contactPerson,
                email: data.email || ""
            })
        }

        // Update user profile status
        await db.update(users).set({ profileCompleted: true }).where(eq(users.id, userId))

        return { success: true }
    } catch (e) {
        console.error("Company profile error:", e)
        return { success: false, message: "Failed to save profile" }
    }
}

export async function completeTechnicianProfileAction(data: { name?: string, experience: number, primarySkill: string, skills: string, address: string }) {
    try {
        const cookiesList = await cookies()
        const sessionToken = cookiesList.get("session_token")?.value
        if (!sessionToken) return { success: false, message: "Unauthorized" }

        const session = JSON.parse(sessionToken)
        const userId = session.userId

        // Update User Name
        if (data.name) {
            await db.update(users).set({ name: data.name }).where(eq(users.id, userId))
        }

        // Parse skills from comma separated string
        const skillsArray = data.skills.split(",").map(s => s.trim()).filter(Boolean)
        // Add primary skill if not in list
        if (data.primarySkill && !skillsArray.includes(data.primarySkill)) {
            skillsArray.unshift(data.primarySkill)
        }

        // Check if technician record exists (it might from registration/admin approval?) 
        // Or we just insert/upsert.

        const existingTech = await db.query.technicians.findFirst({ where: eq(technicians.userId, userId) })

        if (existingTech) {
            await db.update(technicians).set({
                experience: data.experience,
                primarySkill: data.primarySkill,
                skills: skillsArray,
                address: data.address
            }).where(eq(technicians.id, existingTech.id))
        } else {
            await db.insert(technicians).values({
                userId,
                experience: data.experience,
                primarySkill: data.primarySkill,
                skills: skillsArray,
                address: data.address
            })
        }

        // Update user profile status
        await db.update(users).set({ profileCompleted: true }).where(eq(users.id, userId))

        return { success: true }
    } catch (e) {
        console.error("Technician profile error:", e)
        return { success: false, message: "Failed to save profile" }
    }
}

export async function deleteUserAction(userId: string) {
    try {
        const cookiesList = await cookies()
        const sessionToken = cookiesList.get("session_token")?.value

        if (!sessionToken) return { success: false, message: "Unauthorized" }

        // Delete associated profiles first
        await db.delete(companies).where(eq(companies.userId, userId))
        await db.delete(technicians).where(eq(technicians.userId, userId))

        // Delete user
        await db.delete(users).where(eq(users.id, userId))

        return { success: true }
    } catch (e) {
        console.error("Delete user error:", e)
        return { success: false, message: "Failed to delete user" }
    }
}
