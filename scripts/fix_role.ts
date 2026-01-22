
import { db } from "../lib/db"
import { users, companies } from "../db/schema"
import { eq } from "drizzle-orm"

async function main() {
    const userId = "dd8c823a-3aa0-4744-8ae5-db72ce7cbd0a"

    console.log("Fixing role for user:", userId)

    // 1. Update User Role
    const [user] = await db.update(users)
        .set({ role: 'company', status: 'active' })
        .where(eq(users.id, userId))
        .returning()

    if (!user) {
        console.error("User not found!")
        process.exit(1)
    }

    console.log("User updated:", user.name, user.role)

    // 2. Ensure Company Profile
    const existingProfile = await db.query.companies.findFirst({
        where: eq(companies.userId, userId)
    })

    if (!existingProfile) {
        console.log("Creating company profile...")
        await db.insert(companies).values({
            userId: userId,
            companyName: user.name || "Fixed Company",
            gstin: "PENDING",
            address: "Fixed via Script"
        })
        console.log("Company profile created.")
    } else {
        console.log("Company profile already exists.")
    }

    console.log("Done. Please LOGOUT and LOGIN again.")
    process.exit(0)
}

main().catch(console.error)
