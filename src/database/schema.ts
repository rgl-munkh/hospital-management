import { pgTable, uuid, text, boolean, timestamp, integer, jsonb, serial } from "drizzle-orm/pg-core";

// USERS
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ROLES
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// USER ROLES
export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  assignedBy: uuid("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// PATIENTS
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientCode: text("patient_code").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  emergencyName: text("emergency_name"),
  emergencyRelation: text("emergency_relation"),
  emergencyPhone: text("emergency_phone"),
  address: text("address"),
  age: integer("age"),
  gender: text("gender"),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  shoeSize: text("shoe_size"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PRESCRIPTIONS
export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  diagnosisSummary: text("diagnosis_summary"),
  orthoticType: text("orthotic_type"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DIAGNOSES
export const diagnoses = pgTable("diagnoses", {
  id: uuid("id").primaryKey().defaultRandom(),
  prescriptionId: uuid("prescription_id").notNull().references(() => prescriptions.id),
  diagnosisType: text("diagnosis_type"),
  description: text("description"),
  gmfcsLevel: text("gmfcs_level"),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// MEDIA FILES
export const mediaFiles = pgTable("media_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  type: text("type"),
  view: text("view"),
  bodyPart: text("body_part"),
  url: text("url").notNull(),
  notes: text("notes"),
  capturedAt: timestamp("captured_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SCANS
export const scans = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  type: text("type"),
  fileUrl: text("file_url").notNull(),
  version: integer("version").default(1),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// EXTERNAL FILES
export const externalFiles = pgTable("external_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id),
  fileType: text("file_type"),
  fileUrl: text("file_url").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AUDIT LOGS
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableName: text("table_name").notNull(),
  recordId: uuid("record_id").notNull(),
  operation: text("operation").notNull(),
  changedData: jsonb("changed_data"),
  changedBy: uuid("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow(),
});