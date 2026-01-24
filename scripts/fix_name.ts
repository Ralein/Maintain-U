
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

async function main() {
    const phone = "7010840540";
    const newName = "Ralein Nova";

    console.log(`Updating user with phone ${phone} to name "${newName}"...`);

    await db.update(users)
        .set({ name: newName })
        .where(eq(users.phone, phone));

    console.log("Update complete.");
}

main().catch(console.error).finally(() => process.exit(0));
