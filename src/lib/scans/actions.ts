"use server";

import { db } from "@/database/connection";
import { scans } from "@/database/schema";
import { NewScan } from "@/lib/definitions";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

export async function createScan(input: NewScan) {
  try {
    await db.insert(scans).values(input);

    revalidatePath(`/dashboard/patients/${input.patientId}`);
  } catch (error) {
    console.error("Failed to create scan:", error);
    throw new Error("Failed to create scan.");
  }
}

export async function updateScan(
  patientId: string,
  type: string,
  fileUrl: string
) {
  try {
    await db
      .update(scans)
      .set({ fileUrl, updatedAt: new Date() })
      .where(and(eq(scans.patientId, patientId), eq(scans.type, type)));

    revalidatePath(`/dashboard/patients/${patientId}`);
  } catch (error) {
    console.error("Failed to update scan:", error);
    throw new Error("Failed to update scan.");
  }
}

export async function deleteScanById(id: string) {
  try {
    await db.delete(scans).where(eq(scans.id, id));
  } catch (error) {
    console.error("Failed to delete scan:", error);
    throw new Error("Failed to delete scan.");
  }
}
