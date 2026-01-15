
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
    // Custom Admin ID check
    if (phone === "Raleinnova123" || phone === "9876543211" || phone === "9876543213") {
        // Ensure admin exists in DB so we can track them? 
        // We'll map "Raleinnova123" to a specific phone number or just use it as the ID.
        // Let's use a dummy phone for Raleinnova123 to keep uniqueness constraints if 'phone' col is unique and phone-formatted
        // Or if phone col is just text, we can use "Raleinnova123" directly.
        // Schema says phone is text.

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
        // We'll set a simple cookie for now. In prod use JWT/lucia-auth.
        (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role }), { httpOnly: true, path: '/' });

        return { success: true, role: "admin", user }
    }

    // Normal User Flow
    const existingUsers = await db.select().from(users).where(eq(users.phone, phone)).limit(1)

    if (existingUsers.length > 0) {
        const user = existingUsers[0]

        if (user.status === "pending") {
            return { success: false, error: "pending", message: "Account pending verification" }
        }
        if (user.status === "banned") {
            return { success: false, error: "banned", message: "Account suspended" }
        }
        if (user.status === "rejected") {
            return { success: false, error: "rejected", message: "Registration rejected" }
        }

        // Success - Set Cookie
        (await cookies()).set("session_token", JSON.stringify({ userId: user.id, role: user.role }), { httpOnly: true, path: '/' });

        return { success: true, role: user.role as any, user }
    }

    // New User - Create as Pending
    // Logic: "Once admin verifies automatically enter OTP on signup or Login"
    // This means creation happens here.

    // Implicit Role Logic (Based on old mock or just default to Company?)
    // The signup page passes 'role', but verifyOTP signature doesn't have it.
    // We can default to 'company' or infer. 
    // Let's rely on `updateUser` later or pass it? 
    // For now, default `company` unless identified key numbers.

    let role: "company" | "technician" = "company"
    let status: "pending" | "active" = "pending"

    // Legacy Mock Support (Optional - preserving behavior)
    if (phone === "9876543210") { role = "company"; status = "active"; } // ABC Corp
    if (phone === "9876543212") { role = "technician"; status = "active"; } // Raj Kumar

    const [newUser] = await db.insert(users).values({
        phone,
        role,
        status,
        name: "New User"
    }).returning()

    if (status === "pending") {
        return { success: false, error: "pending", message: "Account created, pending verification" }
    }

    (await cookies()).set("session_token", JSON.stringify({ userId: newUser.id, role: newUser.role }), { httpOnly: true, path: '/' });
    return { success: true, role, user: newUser }
}

export async function logoutAction() {
    (await cookies()).delete("session_token")
    return { success: true }
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
export async function adminLoginAction(phone: string, otp: string) {
    // Stricter check?
    // User asked for "verify the admin as well".
    // We can check if user is ALREADY admin in DB.

    // For now verifyOTPAction handles admin check, but we can make a specific one that ONLY allows admins.
    const res = await verifyOTPAction(phone, otp);

    if (res.success && res.role === 'admin') {
        // Set a special admin cookie? Or just the regular one is enough with middleware check?
        // Let's set a specific `admin_session` for double safety as per "create a different way... verify admin"
        (await cookies()).set("admin_session", "true", { httpOnly: true, path: '/' });
        return res;
    }

    if (res.success && res.role !== 'admin') {
        // Log them out immediately if they tried to login to admin portal
        await logoutAction();
        return { success: false, message: "Unauthorized. Not an admin." }
    }

    return res;
}
