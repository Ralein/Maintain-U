CREATE TYPE "public"."invoice_status" AS ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Initiated', 'Authorized', 'Captured', 'Held', 'Settled', 'Disputed', 'Refunded', 'Released');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('Requested', 'Reviewing', 'Team_Forming', 'Invites_Sent', 'Team_Confirmed', 'Dispatched', 'On_The_Way', 'Arrived', 'Work_Started', 'In_Progress', 'Work_Completed', 'Sign_Pending', 'Completed', 'Invoiced', 'Paid', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."reset_status" AS ENUM('none', 'requested', 'approved');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'company', 'technician');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'active', 'banned', 'rejected');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_assignment_id" uuid NOT NULL,
	"technician_id" uuid NOT NULL,
	"status" text DEFAULT 'Assigned',
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"location_check_in" text,
	"has_substitute" boolean DEFAULT false,
	"substitute_id" uuid,
	"salary_amount" double precision,
	"salary_deducted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"industry_type" text,
	"email" text,
	"gstin" text,
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"contact_person" text,
	"spokesperson_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "daily_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"master_team_id" uuid,
	"work_date" date NOT NULL,
	"status" text DEFAULT 'Planned',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"labor_cost" double precision NOT NULL,
	"material_cost" double precision DEFAULT 0,
	"platform_fee" double precision DEFAULT 0,
	"total_amount" double precision NOT NULL,
	"status" "invoice_status" DEFAULT 'Draft',
	"pdf_url" text,
	"generated_at" timestamp DEFAULT now(),
	"sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"technician_id" uuid NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"photos" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"status" "request_status" NOT NULL,
	"master_team_id" uuid,
	"lead_technician_id" uuid,
	"scheduled_start" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"signature_url" text,
	"supervisor_sign_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"master_team_id" uuid NOT NULL,
	"technician_id" uuid NOT NULL,
	"is_lead" boolean DEFAULT false,
	"status" text DEFAULT 'Invited',
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "master_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"status" text DEFAULT 'Forming',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"method" text,
	"gateway_txn_id" text,
	"status" "payment_status" DEFAULT 'Initiated',
	"initiated_at" timestamp DEFAULT now(),
	"captured_at" timestamp,
	"settled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"technician_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"punctuality" integer,
	"professionalism" integer,
	"skill_quality" integer,
	"cleanliness" integer,
	"review_text" text,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"priority" text NOT NULL,
	"description" text NOT NULL,
	"service_type" text,
	"location_address" text,
	"latitude" double precision,
	"longitude" double precision,
	"supervisor_name" text,
	"supervisor_phone" text,
	"preferred_date" date,
	"time_slot" text,
	"photos" text[],
	"status" "request_status" DEFAULT 'Requested' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "substitutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_id" uuid NOT NULL,
	"original_technician_id" uuid NOT NULL,
	"substitute_technician_id" uuid,
	"reason" text,
	"admin_decision" text DEFAULT 'Pending',
	"salary_transferred" boolean DEFAULT false,
	"requested_at" timestamp DEFAULT now(),
	"decided_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "technician_scores" (
	"technician_id" uuid PRIMARY KEY NOT NULL,
	"average_rating" double precision DEFAULT 0,
	"total_jobs" integer DEFAULT 0,
	"total_ratings" integer DEFAULT 0,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dob" date,
	"gender" text,
	"address" text,
	"current_address" text,
	"latitude" double precision,
	"longitude" double precision,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"experience" integer,
	"skills" text[],
	"primary_skill" text,
	"daily_rate" integer,
	"preferred_locations" text[],
	"night_shift_available" boolean DEFAULT false,
	"has_transport" boolean DEFAULT false,
	"bank_details" jsonb,
	"documents" jsonb,
	"rating" double precision DEFAULT 0,
	"status" text DEFAULT 'Pending',
	"rejection_reason" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technicians_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text,
	"role" "role" NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"reset_status" "reset_status" DEFAULT 'none' NOT NULL,
	"name" text,
	"profile_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_daily_assignment_id_daily_assignments_id_fk" FOREIGN KEY ("daily_assignment_id") REFERENCES "public"."daily_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_substitute_id_technicians_id_fk" FOREIGN KEY ("substitute_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_assignments" ADD CONSTRAINT "daily_assignments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_assignments" ADD CONSTRAINT "daily_assignments_master_team_id_master_teams_id_fk" FOREIGN KEY ("master_team_id") REFERENCES "public"."master_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_updates" ADD CONSTRAINT "job_updates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_updates" ADD CONSTRAINT "job_updates_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_lead_technician_id_technicians_id_fk" FOREIGN KEY ("lead_technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_team_members" ADD CONSTRAINT "master_team_members_master_team_id_master_teams_id_fk" FOREIGN KEY ("master_team_id") REFERENCES "public"."master_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_team_members" ADD CONSTRAINT "master_team_members_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_teams" ADD CONSTRAINT "master_teams_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_attendance_id_attendance_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_original_technician_id_technicians_id_fk" FOREIGN KEY ("original_technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_substitute_technician_id_technicians_id_fk" FOREIGN KEY ("substitute_technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_scores" ADD CONSTRAINT "technician_scores_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;