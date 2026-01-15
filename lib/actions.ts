"use server"

import { db } from "@/lib/db"
import { users, requests, jobs, roleEnum, statusEnum, resetStatusEnum } from "@/db/schema"
import { eq, or, and } from "drizzle-orm"
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
            // In a real app we would have a separate 'companies' table for details like GST/Industry
            // For now we just store the user. The extra fields are lost in this simple schema
            // BUT for the MVP admin view, we just need the user record.
        }).where(eq(users.id, existing[0].id)).returning();
    } else {
        // Create new
        [user] = await db.insert(users).values({
            phone,
            role: 'company',
            status: 'pending',
            name: companyName,
        }).returning();
    }

    // Set/Update session
    (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role, status: user.status }), { httpOnly: true, path: '/' });

    return { success: true, user }
}

// Admin Actions
export async function getTechniciansAction() {
    const techUsers = await db.select().from(users).where(eq(users.role, 'technician'));
    // Transform to UI expected format
    return {
        technicians: techUsers.map(u => ({
            id: u.id,
            name: u.name || "Unknown",
            skill: "General", // Placeholder
            rating: 0,
            status: u.status === 'active' ? 'Available' : u.status === 'pending' ? 'Pending' : u.status,
            phone: u.phone
        }))
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
