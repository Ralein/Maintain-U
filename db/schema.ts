
import { pgTable, text, timestamp, uuid, boolean, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "company", "technician"]);
export const statusEnum = pgEnum("status", ["pending", "active", "banned", "rejected"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    phone: text("phone").notNull().unique(),
    role: roleEnum("role").notNull(),
    status: statusEnum("status").default("pending").notNull(),
    name: text("name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const technicians = pgTable("technicians", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull().unique(),
    skills: text("skills").array(),
    rating: text("rating").default("0"),
    status: text("status").default("Pending"), // distinct from user status? keeping for now
});

export const requestStatusEnum = pgEnum("request_status", ["New", "Assigned", "In Progress", "Completed", "Cancelled"]);

export const requests = pgTable("requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: text("company_id").notNull(), // can reference a company table later
    companyName: text("company_name").notNull(),
    type: text("type").notNull(),
    priority: text("priority").notNull(), // Normal, Urgent, etc
    description: text("description").notNull(),
    status: requestStatusEnum("status").default("New").notNull(),
    date: text("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id").references(() => requests.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id),
    status: text("status").notNull(), // Pending, Accepted, In Progress, Completed
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
