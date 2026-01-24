
import { db } from "@/lib/db"
import { users } from "@/db/schema"

async function main() {
    const allUsers = await db.select().from(users);
    console.log("--- ALL USERS ---");
    allUsers.forEach(u => {
        console.log(`ID: ${u.id}, Name: "${u.name}", Phone: ${u.phone}, Role: ${u.role}, Status: ${u.status}`);
    });
}

main().catch(console.error).finally(() => process.exit(0));
