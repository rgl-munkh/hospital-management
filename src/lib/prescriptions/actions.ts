"use server";

import { db } from "@/database/connection";
import { prescriptions } from "@/database/schema";
import { NewPrescription } from "@/lib/definitions";
import { eq } from "drizzle-orm";
import { diagnoses } from "@/database/schema";
import { NewDiagnosis } from "@/lib/definitions";

export async function createPrescription(input: Omit<NewPrescription, "id" | "createdAt" | "updatedAt">) {
  try {
    const [prescription] = await db
      .insert(prescriptions)
      .values(input)
      .returning();
    return prescription;
  } catch (error) {
    console.error("Failed to create prescription:", error);
    throw new Error("Failed to create prescription.");
  }
}

export async function getPrescriptionByPatientId(patientId: string) {
  try {
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId));
    return prescription;
  } catch (error) {
    console.error("Failed to fetch prescription:", error);
    throw new Error("Failed to fetch prescription.");
  }
}

export async function updatePrescription(id: string, input: Partial<NewPrescription>) {
  try {
    const [prescription] = await db
      .update(prescriptions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(prescriptions.id, id))
      .returning();
    return prescription;
  } catch (error) {
    console.error("Failed to update prescription:", error);
    throw new Error("Failed to update prescription.");
  }
}

export async function getDiagnosisByPrescriptionId(prescriptionId: string) {
  try {
    const [diagnosis] = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.prescriptionId, prescriptionId));
    return diagnosis;
  } catch (error) {
    console.error("Failed to fetch diagnosis:", error);
    throw new Error("Failed to fetch diagnosis.");
  }
}

export async function createDiagnosis(input: Omit<NewDiagnosis, "id" | "createdAt" | "updatedAt">) {
  try {
    const [diagnosis] = await db
      .insert(diagnoses)
      .values(input)
      .returning();
    return diagnosis;
  } catch (error) {
    console.error("Failed to create diagnosis:", error);
    throw new Error("Failed to create diagnosis.");
  }
}

export async function updateDiagnosis(id: string, input: Partial<NewDiagnosis>) {
  try {
    const [diagnosis] = await db
      .update(diagnoses)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(diagnoses.id, id))
      .returning();
    return diagnosis;
  } catch (error) {
    console.error("Failed to update diagnosis:", error);
    throw new Error("Failed to update diagnosis.");
  }
} 