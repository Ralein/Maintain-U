
import { pgTable, text, timestamp, uuid, boolean, pgEnum, integer, jsonb, date } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "company", "technician"]);
export const statusEnum = pgEnum("status", ["pending", "active", "banned", "rejected"]);
export const resetStatusEnum = pgEnum("reset_status", ["none", "requested", "approved"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    phone: text("phone").notNull().unique(),
    passwordHash: text("password_hash"), // null until user sets password after verification
    role: roleEnum("role").notNull(),
    status: statusEnum("status").default("pending").notNull(),
    resetStatus: resetStatusEnum("reset_status").default("none").notNull(),
    name: text("name"),
    profileCompleted: boolean("profile_completed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull().unique(),
    companyName: text("company_name").notNull(),
    email: text("email"),
    gstin: text("gstin"), // Optional for now, or mandatory depending on requirements
    address: text("address"),
    contactPerson: text("contact_person"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const technicians = pgTable("technicians", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull().unique(),

    // Personal Details
    dob: date("dob"),
    gender: text("gender"),
    address: text("address"),

    // Professional Details
    experience: integer("experience"),
    skills: text("skills").array(), // Primary + Secondary skills can be stored here or separate
    primarySkill: text("primary_skill"),
    dailyRate: integer("daily_rate"),

    // Documents & Bank
    bankDetails: jsonb("bank_details"), // Store { bankName, accountHolder, accountNumber, ifsc, upi }
    documents: jsonb("documents"), // Store { aadharFront, aadharBack, pan, photo, signature }

    rating: text("rating").default("0"),
    status: text("status").default("Pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const requestStatusEnum = pgEnum("request_status", ["New", "Assigned", "In Progress", "Completed", "Cancelled"]);

export const requests = pgTable("requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: text("company_id").notNull(),
    companyName: text("company_name").notNull(),
    type: text("type").notNull(),
    priority: text("priority").notNull(),
    description: text("description").notNull(),

    // New fields
    timeSlot: text("time_slot"),
    supervisor: text("supervisor"),
    supervisorPhone: text("supervisor_phone"),
    photos: text("photos").array(), // Array of photo URLs

    status: requestStatusEnum("status").default("New").notNull(),
    date: text("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id").references(() => requests.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id),
    status: text("status").notNull(), // Pending, Accepted, In Progress, Completed

    // Completion details
    signature: text("signature"),
    completedAt: timestamp("completed_at"),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id).notNull(),
    date: text("date").notNull(),
    checkInTime: timestamp("check_in_time"),
    checkOutTime: timestamp("check_out_time"),
    locationCheckIn: text("location_check_in"),
    status: text("status").default("present"), // present, absent, late
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobUpdates = pgTable("job_updates", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id).notNull(),
    message: text("message").notNull(),
    photos: text("photos").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
