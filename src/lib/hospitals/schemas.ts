import { z } from "zod";

export const createHospitalSchema = z.object({
  hospitalCode: z
    .string()
    .min(2, "Hospital code must be at least 2 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Hospital code must contain only uppercase letters and numbers"
    ),
  name: z
    .string()
    .min(2, "Hospital name must be at least 2 characters")
    .regex(
      /^[a-zA-Z\s\-&.]+$/,
      "Hospital name must contain only letters, spaces, hyphens, ampersands, and periods"
    ),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateHospitalSchema = z.object({
  hospitalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim().length === 0 || val.length >= 2,
      "Hospital code must be at least 2 characters"
    )
    .refine(
      (val) => !val || val.trim().length === 0 || /^[A-Z0-9]+$/.test(val),
      "Hospital code must contain only uppercase letters and numbers"
    ),
  name: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim().length === 0 || val.length >= 2,
      "Hospital name must be at least 2 characters"
    ),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
}); 