
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { sql } from "drizzle-orm";

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("../lib/db");

    console.log("Resetting database...");
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
    console.log("Database reset complete.");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
