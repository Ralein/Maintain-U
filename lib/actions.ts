
"use server"

import { db } from "@/lib/db"
import { users, requests, jobs, roleEnum, statusEnum } from "@/db/schema"
import { eq, or, and } from "drizzle-orm"
import { cookies } from "next/headers"

// Helper to simulate delay if requested, or just remove locally
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function sendOTPAction(phone: string) {
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

        return { success: true, status: user.status, role: user.role }
    } catch (e) {
        return { success: false }
    }
}
