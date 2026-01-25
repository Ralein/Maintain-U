
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, companies, requests, jobs, technicians } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        console.log("Seeding database...");

        // 1. Create Techs if not exist
        let techUser = await db.query.users.findFirst({ where: eq(users.phone, "9876543212") });
        if (!techUser) {
            [techUser] = await db.insert(users).values({
                phone: "9876543212",
                role: "technician",
                status: "active",
                name: "Raj Kumar"
            }).returning();
        }

        const techProfile = await db.query.technicians.findFirst({ where: eq(technicians.userId, techUser.id) });
        if (!techProfile) {
            await db.insert(technicians).values({
                userId: techUser.id,
                primarySkill: "Electrical",
                status: "Available",
                rating: 4.8,
                experience: 5
            });
        }

        // 2. Create Company
        let compUser = await db.query.users.findFirst({ where: eq(users.phone, "9876543210") });
        if (!compUser) {
            [compUser] = await db.insert(users).values({
                phone: "9876543210",
                role: "company",
                status: "active",
                name: "ABC Industries"
            }).returning();
        }

        let company = await db.query.companies.findFirst({ where: eq(companies.userId, compUser.id) });
        if (!company) {
            [company] = await db.insert(companies).values({
                userId: compUser.id,
                companyName: "ABC Industries",
                industryType: "Manufacturing",
                address: "Sector 18, Gurgaon"
            }).returning();
        }

        // 3. Create Requests
        const reqs = await db.select().from(requests);
        if (reqs.length === 0) {
            const [r1] = await db.insert(requests).values({
                companyId: company.id,
                serviceType: "Electrical",
                priority: "Urgent",
                description: "Main Fuse Blown",
                status: "Requested",
                preferredDate: new Date().toISOString().split('T')[0]
            }).returning();

            const [r2] = await db.insert(requests).values({
                companyId: company.id,
                serviceType: "Mechanical",
                priority: "Normal",
                description: "Conveyor Belt Issue",
                status: "In_Progress",
                preferredDate: new Date().toISOString().split('T')[0]
            }).returning();

            // Create Job for In_Progress
            await db.insert(jobs).values({
                requestId: r2.id,
                status: "In_Progress",
                startedAt: new Date()
            });
        }

        return NextResponse.json({ success: true, message: "Seeded" });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
