"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/database/connection";
import { patients } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createPatientSchema, updatePatientSchema } from "./schemas";
import { CreatePatientState, UpdatePatientState } from "./types";
import { buildUpdateData } from "./utils";

export async function createPatient(
  _prevState: CreatePatientState,
  formData: FormData
): Promise<CreatePatientState> {
  const validatedFields = createPatientSchema.safeParse({
    patientCode: formData.get("patientCode"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to create patient.",
    };
  }

  const { patientCode, firstName, lastName } = validatedFields.data;

  try {
    await db
      .insert(patients)
      .values({
        patientCode,
        firstName,
        lastName,
      })
      .returning();

    revalidatePath("/dashboard/patients");
  } catch (error) {
    console.error("Failed to create patient:", error);
    return {
      message: (error as Error).message,
    };
  }

  redirect("/dashboard/patients");
}

export async function updatePatient(
  _prevState: UpdatePatientState,
  formData: FormData
): Promise<UpdatePatientState> {
  const validatedFields = updatePatientSchema.safeParse({
    patientCode: formData.get("patientCode") || "",
    firstName: formData.get("firstName") || "",
    lastName: formData.get("lastName") || "",
    age: formData.get("age") || "",
    gender: formData.get("gender") || "",
    address: formData.get("address") || "",
    heightCm: formData.get("heightCm") || "",
    weightKg: formData.get("weightKg") || "",
    shoeSize: formData.get("shoeSize") || "",
    emergencyName: formData.get("emergencyName") || "",
    emergencyRelation: formData.get("emergencyRelation") || "",
    emergencyPhone: formData.get("emergencyPhone") || "",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: validatedFields.error.message,
    };
  }

  const updateData = buildUpdateData(validatedFields.data);

  try {
    await db
      .update(patients)
      .set(updateData)
      .where(eq(patients.id, formData.get("id") as string));

    revalidatePath(`/dashboard/patients/${formData.get("id")}`);
    return {
      success: true,
      message: "Patient updated successfully!",
    };
  } catch (error) {
    console.error("Failed to update patient:", error);
    return {
      message: "Database error: Failed to update patient.",
    };
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
