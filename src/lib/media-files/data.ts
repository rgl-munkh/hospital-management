import { db } from "@/database/connection";
import { mediaFiles } from "@/database/schema";
import { desc, eq } from "drizzle-orm";

export async function fetchPatientMediaFiles(patientId: string) {
  try {
    const data = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.patientId, patientId))
      .orderBy(desc(mediaFiles.createdAt));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch patient media files.");
  }
} 