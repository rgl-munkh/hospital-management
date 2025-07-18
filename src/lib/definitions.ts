// This file contains type definitions for your data.
// Using Drizzle's generated types for better type safety and consistency.

import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  patients,
  hospitals,
  roles,
  userRoles,
  prescriptions,
  diagnoses,
  mediaFiles,
  scans,
  externalFiles,
  auditLogs,
} from "@/database/schema";

// User types 
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Patient types
export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;

// Hospital types
export type Hospital = InferSelectModel<typeof hospitals>;
export type NewHospital = InferInsertModel<typeof hospitals>;

// Role types
export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;

// UserRole types
export type UserRole = InferSelectModel<typeof userRoles>;
export type NewUserRole = InferInsertModel<typeof userRoles>;

// Prescription types
export type Prescription = InferSelectModel<typeof prescriptions>;
export type NewPrescription = InferInsertModel<typeof prescriptions>;

// Diagnosis types
export type Diagnosis = InferSelectModel<typeof diagnoses>;
export type NewDiagnosis = InferInsertModel<typeof diagnoses>;

// MediaFile types
export type MediaFile = InferSelectModel<typeof mediaFiles>;
export type NewMediaFile = InferInsertModel<typeof mediaFiles>;

// Scan types
export type Scan = InferSelectModel<typeof scans>;
export type NewScan = InferInsertModel<typeof scans>;

// ExternalFile types
export type ExternalFile = InferSelectModel<typeof externalFiles>;
export type NewExternalFile = InferInsertModel<typeof externalFiles>;

// AuditLog types
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;

// Utility types for table displays
export type PatientField = Pick<
  Patient,
  "id" | "patientCode" | "firstName" | "lastName"
>;
export type HospitalField = Pick<Hospital, "id" | "hospitalCode" | "name">;
