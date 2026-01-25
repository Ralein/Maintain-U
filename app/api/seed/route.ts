
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requests, jobs, dailyAssignments, attendance, notifications, jobUpdates, substitutions, ratings, invoices, payments, technicians, companies, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        console.log("Full Factory Reset...");

        // Delete all transactional data in reverse dependency order
        await db.delete(notifications);
        await db.delete(attendance);
        await db.delete(substitutions);
        await db.delete(dailyAssignments);
        await db.delete(jobUpdates);
        await db.delete(ratings);
        await db.delete(payments);
        await db.delete(invoices);
        await db.delete(jobs);
        await db.delete(requests);

        // Delete Profiles
        await db.delete(technicians);
        await db.delete(companies);

        // Delete Users (Except maybe hardcoded admins if we wanted, but let's wipe all for "Remove all mockups")
        await db.delete(users);

        // RESTORE ACCESS: Create Essential Users Only
        // 1. Admin
        await db.insert(users).values({
            phone: "Raleinnova123",
            role: "admin",
            status: "active",
            name: "Admin User",
            // Add a password or rely on magic login if applicable. Using simple setup.
        });

        // 2. Company (ABC Industries) - For creating new requests
        const [compUser] = await db.insert(users).values({
            phone: "9876543210",
            role: "company",
            status: "active",
            name: "ABC Industries"
        }).returning();

        await db.insert(companies).values({
            userId: compUser.id,
            companyName: "ABC Industries",
            industryType: "Manufacturing",
            address: "Sector 18, Gurgaon"
        });

        // 3. Technician (Raj Kumar) - For accepting jobs
        const [techUser] = await db.insert(users).values({
            phone: "9876543212",
            role: "technician",
            status: "active",
            name: "Raj Kumar"
        }).returning();

        await db.insert(technicians).values({
            userId: techUser.id,
            primarySkill: "Electrical",
            status: "Available",
            rating: 5.0,
            experience: 5
        });

        return NextResponse.json({ success: true, message: "System Reset & Access Restored" });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
