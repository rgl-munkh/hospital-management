"use server";

import { db } from "@/database/connection";
import { scans } from "@/database/schema";
import { NewScan } from "@/lib/definitions";
import { revalidatePath } from "next/cache";

export async function createScan(input: NewScan) {
  try {
    await db.insert(scans).values(input);

    revalidatePath(`/dashboard/patients/${input.patientId}`);
  } catch (error) {
    console.error("Failed to create scan:", error);
    throw new Error("Failed to create scan.");
  }
}
