"use server";

import { revalidatePath } from "next/cache";

import { fetchPatientById as fetchPatientByIdData } from "@/lib/patients/data";
import { db } from "@/database/connection";
import { patients } from "@/database/schema";
import { eq } from "drizzle-orm";
import { PatientForm } from "@/lib/definitions";

export async function createPatient(formData: PatientForm) {
  try {
    const patient = await db
      .insert(patients)
      .values({
        patientCode: formData.patientCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })
      .returning();

    console.log(patient);
    revalidatePath("/dashboard/patients");
  } catch (error) {
    console.error("Failed to create patient:", error);
    throw new Error("Failed to create patient.");
  }
}

export async function updatePatient(
  id: string,
  formData: Partial<PatientForm>
) {
  try {
    await db
      .update(patients)
      .set({ ...formData, updatedAt: new Date() })
      .where(eq(patients.id, id));

    revalidatePath("/dashboard/patients");
  } catch (error) {
    console.error("Failed to update patient:", error);
    throw new Error("Failed to update patient.");
  }
}

export async function deletePatient(id: string) {
  try {
    await db.delete(patients).where(eq(patients.id, id));
    revalidatePath("/dashboard/patients");
  } catch (error) {
    console.error("Failed to delete patient:", error);
    throw new Error("Failed to delete patient.");
  }
}

export async function fetchPatientById(id: string) {
  try {
    const patient = await fetchPatientByIdData(id);
    return patient;
  } catch (error) {
    console.error("Failed to fetch patient:", error);
    throw new Error("Failed to fetch patient.");
  }
}
