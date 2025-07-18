'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/database/connection';
import { hospitals } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { createHospitalSchema, updateHospitalSchema } from './schemas';
import { CreateHospitalState, UpdateHospitalState } from './types';
import { buildUpdateData } from './utils';

export async function createHospital(
  _prevState: CreateHospitalState,
  formData: FormData
): Promise<CreateHospitalState> {
  const validatedFields = createHospitalSchema.safeParse({
    hospitalCode: formData.get("hospitalCode"),
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    isActive: true,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to create hospital.",
    };
  }

  const { hospitalCode, name, address, phone, email, website } = validatedFields.data;

  try {
    await db
      .insert(hospitals)
      .values({
        hospitalCode,
        name,
        address,
        phone,
        email,
        website,
        isActive: true,
      })
      .returning();

    revalidatePath("/dashboard/hospitals");
  } catch (error) {
    console.error("Failed to create hospital:", error);
    return {
      message: (error as Error).message,
    };
  }

  redirect("/dashboard/hospitals");
}

export async function updateHospital(
  _prevState: UpdateHospitalState,
  formData: FormData
): Promise<UpdateHospitalState> {
  const validatedFields = updateHospitalSchema.safeParse({
    hospitalCode: formData.get("hospitalCode") || "",
    name: formData.get("name") || "",
    address: formData.get("address") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    website: formData.get("website") || "",
    isActive: formData.get("isActive") === "true",
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
      .update(hospitals)
      .set(updateData)
      .where(eq(hospitals.id, formData.get("id") as string));

    revalidatePath(`/dashboard/hospitals/${formData.get("id")}`);
    return {
      success: true,
      message: "Hospital updated successfully!",
    };
  } catch (error) {
    console.error("Failed to update hospital:", error);
    return {
      message: "Database error: Failed to update hospital.",
    };
  }
}

export async function deleteHospital(id: string) {
  try {
    await db.delete(hospitals).where(eq(hospitals.id, id));
    revalidatePath("/dashboard/hospitals");
  } catch (error) {
    console.error("Failed to delete hospital:", error);
    throw new Error("Failed to delete hospital.");
  }
} 