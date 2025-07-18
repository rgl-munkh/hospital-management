"use server";

import { db } from "@/database/connection";
import { scans } from "@/database/schema";
import { Scan } from "@/lib/definitions";
import { and, eq } from "drizzle-orm";

export async function fetchScansByTypeAndPatientId(
  type: string,
  patientId: string
): Promise<Scan[]> {
  try {
    const data = await db
      .select()
      .from(scans)
      .where(and(eq(scans.type, type), eq(scans.patientId, patientId)));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch scans by type and patient id.");
  }
}
