// This file contains type definitions for your data.
// Using Drizzle's generated types for better type safety and consistency.

import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, patients, roles, userRoles, prescriptions, diagnoses, mediaFiles, scans, externalFiles, auditLogs } from '@/database/schema';

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Patient types
export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;

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

// Form types for patient operations
export type PatientForm = {
  patientCode: string;
  firstName: string;
  lastName: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  address?: string;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  shoeSize?: string;
};

// Utility types for table displays
export type PatientField = Pick<Patient, 'id' | 'patientCode' | 'firstName' | 'lastName'>; 