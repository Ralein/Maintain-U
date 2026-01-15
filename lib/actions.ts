
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
// Admin Login Specific Action (for critical admin access)
export async function adminLoginAction(id: string, pass: string) {
    // Hidden Credentials & Hashing
    const ADMIN_ID = "Ralein Nova";
    // SHA-256 hash of "Raleinnova12345"
    const ADMIN_PASS_HASH = "8f3c78822026852ba71ab6316fa769f291307b23538bd13b711e59343729e20a";

    // Server-side crypto check
    const { createHash } = await import("crypto");
    // Trim input ID to handle copy-paste whitespace
    const cleanId = id.trim();
    const inputHash = createHash("sha256").update(pass).digest("hex");

    console.log("Admin Login Attempt:", { id: cleanId }); // Don't log password

    if (cleanId === ADMIN_ID && inputHash === ADMIN_PASS_HASH) {
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
        console.log("Invalid Credentials", { providedId: cleanId, expectedId: ADMIN_ID, hashMatch: inputHash === ADMIN_PASS_HASH });
    }

    return { success: false, message: "Invalid Administration ID or Password" };
}
