
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requests, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const reqs = await db.select().from(requests);
        const allJobs = await db.select().from(jobs);

        return NextResponse.json({
            reqCount: reqs.length,
            jobCount: allJobs.length,
            reqStatuses: reqs.map(r => r.status),
            jobStatuses: allJobs.map(j => j.status)
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
