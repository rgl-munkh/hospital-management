import { z } from "zod";

export const createPatientSchema = z.object({
  patientCode: z
    .string()
    .min(2, "Patient code must be at least 2 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Patient code must contain only uppercase letters and numbers"
    ),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(
      /^[\p{L}\s-]+$/u,
      "First name must contain only letters, spaces, and hyphens"
    ),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(
      /^[\p{L}\s-]+$/u,
      "Last name must contain only letters, spaces, and hyphens"
    ),
});

export const updatePatientSchema = z.object({
  patientCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim().length === 0 || val.length >= 2,
      "Patient code must be at least 2 characters"
    )
    .refine(
      (val) => !val || val.trim().length === 0 || /^[A-Z0-9]+$/.test(val),
      "Patient code must contain only uppercase letters and numbers"
    ),
  firstName: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim().length === 0 || val.length >= 2,
      "First name must be at least 2 characters"
    ),
  lastName: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim().length === 0 || val.length >= 2,
      "Last name must be at least 2 characters"
    ),
  age: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? parseInt(val) : undefined))
    .refine(
      (val) => !val || (val >= 0 && val <= 150),
      "Age must be between 0 and 150"
    ),
  gender: z.string().optional(),
  address: z.string().optional(),
  heightCm: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? parseInt(val) : undefined))
    .refine(
      (val) => !val || (val >= 50 && val <= 300),
      "Height must be between 50 and 300 cm"
    ),
  weightKg: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? parseInt(val) : undefined))
    .refine(
      (val) => !val || (val >= 1 && val <= 500),
      "Weight must be between 1 and 500 kg"
    ),
  shoeSize: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
});
