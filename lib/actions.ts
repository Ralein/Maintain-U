"use server"

import { db } from "@/lib/db"
import { users, companies, technicians, requests, jobs, attendance, jobUpdates, roleEnum, statusEnum, resetStatusEnum } from "@/db/schema"
import { eq, or, and, desc } from "drizzle-orm"
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
            address: address || ""
        })
    }

    // Set/Update session
    (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });

    return { success: true, user }
}

// Admin Actions

export async function getRequestsAction() {
    // Fetch all requests for admin
    const allRequests = await db.select().from(requests).orderBy(requests.createdAt);
    return { requests: allRequests }
}

export async function getCompanyRequestsAction() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { requests: [] }

    const session = JSON.parse(sessionToken.value)

    const compRequests = await db.select().from(requests)
        .where(eq(requests.companyId, session.userId))
        .orderBy(requests.createdAt);

    return { requests: compRequests }
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
                lastSeen = lastAttendance[0].date
            }
        }

        // Mock locations for specific users if no real data (to simulate live map for demo)
        if (!location) {
            if (user.phone === "9876543212") location = { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" } // Raj
            else if (user.name?.includes("Amit")) location = { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" }
            else if (user.name?.includes("Sara")) location = { lat: 12.9352, lng: 77.6245, address: "Koramangala, Bangalore" }
        }

        return {
            id: user.id, // Use user ID for admin actions usually
            techId: tech?.id,
            name: user.name || "Unknown",
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

    try {
        const [newReq] = await db.insert(requests).values({
            companyId: session.userId, // Storing User ID as Company ID to match retrieval logic
            companyName: companyProfile?.companyName || companyUser.name || "Unknown Company",
            type: data.serviceType,
            priority: data.priority,
            description: data.description,
            timeSlot: data.timeSlot,
            date: data.date,
            supervisor: data.supervisor,
            supervisorPhone: data.supervisorPhone,
            photos: data.photos || [],
            status: "New"
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
            // Insert
            await db.insert(technicians).values({
                userId: user.id,
                dob: techData.dob,
                gender: techData.gender,
                address: techData.address,
                experience: parseInt(techData.experience) || 0,
                primarySkill: techData.primarySkill,
                skills: [techData.primarySkill],
                dailyRate: parseInt(techData.dailyRate) || 0,
                bankDetails: {
                    bankName: techData.bankName,
                    accountHolder: techData.accountHolder,
                    accountNumber: techData.accountNumber,
                    ifsc: techData.ifsc,
                    upi: techData.upi
                },
                documents: {}, // Empty for now
                status: "Pending"
            } as any);
        }

        // Update session to reflect pending status
        (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: 'technician', status: 'pending' }), { httpOnly: true, path: '/' });

        return { success: true }
    } catch (e) {
        console.error("Register technician error:", e)
        return { success: false, message: "Registration failed" }
    }
}

export async function getRequestByIdAction(id: string) {
    // Find request
    const request = await db.query.requests.findFirst({
        where: eq(requests.id, id)
    })
    return { request }
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
        // 1. Update Request Status
        await db.update(requests)
            .set({ status: 'Assigned' })
            .where(eq(requests.id, requestId));

        // 2. Create Job Entries for each technician
        // Check if jobs already exist for this request to prevent duplicates? 
        // For simplicity, we assume fresh assignment or just insert.

        const jobValues = techIds.map(techId => ({
            requestId,
            technicianId: techId, // This might need lookup if techId passed is user.id not technician.id
            // Ideally UI passes technician.id. Let's assume it does.
            status: 'Pending', // Tech needs to accept
        }))

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

        const techs = await db.select().from(technicians)
            .where(or(...techIds.map(uid => eq(technicians.userId, uid))));

        const resolvedJobValues = techs.map(t => ({
            requestId,
            technicianId: t.id,
            status: 'Pending'
        }));

        if (resolvedJobValues.length > 0) {
            await db.insert(jobs).values(resolvedJobValues);
        }

        return { success: true }
    } catch (e) {
        console.error("Assign team error:", e)
        return { success: false, message: "Failed to assign team" }
    }
}

export async function getJobsAction() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")
    if (!sessionToken) return { jobs: [] }

    const session = JSON.parse(sessionToken.value)

    // If technician, fetch their jobs
    if (session.role === 'technician') {
        const result = await db.select({
            job: jobs,
            req: requests
        })
            .from(jobs)
            .innerJoin(requests, eq(jobs.requestId, requests.id))
            .where(eq(jobs.technicianId, session.userId)) // Assuming userId in session maps to technicianId directly in jobs?
        // Wait, jobs.technicianId stores TECHNICIAN table ID. session.userId matches USERS.id.
        // We need to look up technician ID from user ID first.

        const tech = await db.query.technicians.findFirst({
            where: eq(technicians.userId, session.userId)
        })

        if (!tech) return { jobs: [] }

        const techJobs = await db.select({
            job: jobs,
            req: requests
        })
            .from(jobs)
            .innerJoin(requests, eq(jobs.requestId, requests.id))
            .where(eq(jobs.technicianId, tech.id))
            .orderBy(jobs.updatedAt);

        return {
            jobs: techJobs.map(({ job, req }) => ({
                id: job.id,
                requestId: req.id,
                technicianId: job.technicianId,
                company: req.companyName,
                service: req.type,
                status: job.status,
                location: "Location Placeholder",
                time: req.timeSlot,
                date: req.date
            }))
        }
    }

    // If Admin, maybe fetch all? Or specific admin job view? 
    // Usually admin views Requests, not individual technician jobs directly in this list.
    return { jobs: [] }
}

export async function getJobByIdAction(id: string) {
    const result = await db.select({
        job: jobs,
        req: requests
    })
        .from(jobs)
        .innerJoin(requests, eq(jobs.requestId, requests.id))
        .where(eq(jobs.id, id))
        .limit(1);

    if (result.length === 0) return { job: null }

    const { job, req } = result[0];

    return {
        job: {
            id: job.id,
            requestId: req.id,
            technicianId: job.technicianId,
            company: req.companyName,
            address: "Address Placeholder",
            service: req.type,
            description: req.description,
            supervisor: req.supervisor,
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
            .set({ status: 'Accepted', updatedAt: new Date() })
            .where(eq(jobs.id, jobId));

        return { success: true }
    } catch (e) {
        return { success: false, message: "Failed to accept job" }
    }
}

export async function checkInAction(jobId: string, location: any) {
    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
    if (!job) return { success: false, message: "Job not found" }

    // Create attendance record
    try {
        await db.insert(attendance).values({
            jobId,
            technicianId: job.technicianId!,
            date: new Date().toLocaleDateString("en-US"),
            checkInTime: new Date(),
            locationCheckIn: JSON.stringify(location),
            status: 'present'
        })

        // Update Job status
        await db.update(jobs)
            .set({ status: 'In Progress', updatedAt: new Date() })
            .where(eq(jobs.id, jobId));

        return { success: true }
    } catch (e) {
        console.error("Check-in error:", e)
        return { success: false, message: "Failed to check in" }
    }
}

export async function postJobUpdateAction(jobId: string, message: string, photos: string[]) {
    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
    if (!job) return { success: false }

    try {
        await db.insert(jobUpdates).values({
            jobId,
            technicianId: job.technicianId!,
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
                status: 'Completed',
                signature,
                completedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(jobs.id, jobId));

        // Also ensure check-out if not done? 
        // For simplicity, we assume check-out is separate or auto-done.
        // Let's find open attendance for today and close it.
        const today = new Date().toLocaleDateString("en-US")
        const openAttendance = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.jobId, jobId),
                eq(attendance.date, today)
            )
        })

        if (openAttendance && !openAttendance.checkOutTime) {
            await db.update(attendance)
                .set({ checkOutTime: new Date() })
                .where(eq(attendance.id, openAttendance.id));
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
