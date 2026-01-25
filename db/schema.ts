
import { pgTable, text, timestamp, uuid, boolean, pgEnum, integer, jsonb, date, doublePrecision } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "company", "technician"]);
export const statusEnum = pgEnum("status", ["pending", "active", "banned", "rejected"]);
export const resetStatusEnum = pgEnum("reset_status", ["none", "requested", "approved"]);

// Extended Status Enums based on Architecture
export const requestStatusEnum = pgEnum("request_status", [
    "Requested", "Reviewing", "Team_Forming", "Invites_Sent", "Team_Confirmed",
    "Dispatched", "On_The_Way", "Arrived", "Work_Started", "In_Progress",
    "Work_Completed", "Sign_Pending", "Completed", "Invoiced", "Paid", "Cancelled"
]);

export const invoiceStatusEnum = pgEnum("invoice_status", ["Draft", "Sent", "Paid", "Overdue", "Cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["Initiated", "Authorized", "Captured", "Held", "Settled", "Disputed", "Refunded", "Released"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    phone: text("phone").notNull().unique(),
    passwordHash: text("password_hash"),
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
    industryType: text("industry_type"),
    email: text("email"),
    gstin: text("gstin"),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    contactPerson: text("contact_person"),
    spokespersonPhone: text("spokesperson_phone"),
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
    currentAddress: text("current_address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),

    // Professional Details
    experience: integer("experience"),
    skills: text("skills").array(),
    primarySkill: text("primary_skill"),
    dailyRate: integer("daily_rate"),
    preferredLocations: text("preferred_locations").array(),
    nightShiftAvailable: boolean("night_shift_available").default(false),
    hasTransport: boolean("has_transport").default(false),

    // Documents & Bank
    bankDetails: jsonb("bank_details"), // { bankName, accountHolder, accountNumber, ifsc, upi }
    documents: jsonb("documents"), // { photo, signature, resume, aadharFront, aadharBack, pan, etc }

    rating: doublePrecision("rating").default(0.0),
    status: text("status").default("Pending"),
    rejectionReason: text("rejection_reason"),
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const requests = pgTable("requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").references(() => companies.id).notNull(),
    priority: text("priority").notNull(),
    description: text("description").notNull(),
    serviceType: text("service_type"), // E.g., Electrical, Mechanical

    // Location & Contact (Snapshot from Company profile or override)
    locationAddress: text("location_address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    supervisorName: text("supervisor_name"),
    supervisorPhone: text("supervisor_phone"),

    preferredDate: date("preferred_date"),
    timeSlot: text("time_slot"),
    photos: text("photos").array(),

    status: requestStatusEnum("status").default("Requested").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Jobs = Executed Requests
export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id").references(() => requests.id).notNull(),
    status: requestStatusEnum("status").notNull(), // Synced with Request status

    masterTeamId: uuid("master_team_id"), // Linked later
    leadTechnicianId: uuid("lead_technician_id").references(() => technicians.id),

    scheduledStart: timestamp("scheduled_start"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),

    signatureUrl: text("signature_url"),
    supervisorSignName: text("supervisor_sign_name"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const masterTeams = pgTable("master_teams", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),
    status: text("status").default("Forming"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const masterTeamMembers = pgTable("master_team_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    masterTeamId: uuid("master_team_id").references(() => masterTeams.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id).notNull(),
    isLead: boolean("is_lead").default(false),
    status: text("status").default("Invited"), // Invited, Accepted, Declined, Removed
    addedAt: timestamp("added_at").defaultNow(),
});

export const dailyAssignments = pgTable("daily_assignments", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),
    masterTeamId: uuid("master_team_id").references(() => masterTeams.id),
    workDate: date("work_date").notNull(),
    status: text("status").default("Planned"), // Planned, Active, Completed
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
    id: uuid("id").defaultRandom().primaryKey(),
    dailyAssignmentId: uuid("daily_assignment_id").references(() => dailyAssignments.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id).notNull(),

    status: text("status").default("Assigned"), // Assigned, Present, Absent, Substitute_Requested

    checkInTime: timestamp("check_in_time"),
    checkOutTime: timestamp("check_out_time"),
    locationCheckIn: text("location_check_in"), // Lat,Long or Address

    hasSubstitute: boolean("has_substitute").default(false),
    substituteId: uuid("substitute_id").references(() => technicians.id),

    salaryAmount: doublePrecision("salary_amount"),
    salaryDeducted: boolean("salary_deducted").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const substitutions = pgTable("substitutions", {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id").references(() => attendance.id).notNull(),
    originalTechnicianId: uuid("original_technician_id").references(() => technicians.id).notNull(),
    substituteTechnicianId: uuid("substitute_technician_id").references(() => technicians.id),

    reason: text("reason"),
    adminDecision: text("admin_decision").default("Pending"), // Pending, Approved, Rejected
    salaryTransferred: boolean("salary_transferred").default(false),

    requestedAt: timestamp("requested_at").defaultNow(),
    decidedAt: timestamp("decided_at"),
});

export const jobUpdates = pgTable("job_updates", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id).notNull(),
    type: text("type").notNull(), // Status, Issue, General
    message: text("message").notNull(),
    photos: text("photos").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),

    laborCost: doublePrecision("labor_cost").notNull(),
    materialCost: doublePrecision("material_cost").default(0.0),
    platformFee: doublePrecision("platform_fee").default(0.0),
    totalAmount: doublePrecision("total_amount").notNull(),

    status: invoiceStatusEnum("status").default("Draft"),
    pdfUrl: text("pdf_url"),

    generatedAt: timestamp("generated_at").defaultNow(),
    sentAt: timestamp("sent_at"),
});

export const payments = pgTable("payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
    companyId: uuid("company_id").references(() => companies.id).notNull(),

    amount: doublePrecision("amount").notNull(),
    method: text("method"), // UPI, Card, NetBanking
    gatewayTxnId: text("gateway_txn_id"),

    status: paymentStatusEnum("status").default("Initiated"),

    initiatedAt: timestamp("initiated_at").defaultNow(),
    capturedAt: timestamp("captured_at"),
    settledAt: timestamp("settled_at"),
});

export const ratings = pgTable("ratings", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),
    companyId: uuid("company_id").references(() => companies.id).notNull(),
    technicianId: uuid("technician_id").references(() => technicians.id).notNull(),

    overallScore: integer("overall_score").notNull(),
    punctuality: integer("punctuality"),
    professionalism: integer("professionalism"),
    skillQuality: integer("skill_quality"),
    cleanliness: integer("cleanliness"),

    reviewText: text("review_text"),
    tags: text("tags").array(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const technicianScores = pgTable("technician_scores", {
    technicianId: uuid("technician_id").references(() => technicians.id).primaryKey(),
    averageRating: doublePrecision("average_rating").default(0.0),
    totalJobs: integer("total_jobs").default(0),
    totalRatings: integer("total_ratings").default(0),
    lastUpdated: timestamp("last_updated").defaultNow(),
});

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(), // Job_Update, Payment, System
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
