"use server";

import { revalidatePath } from "next/cache";
import { fetchPatientMediaFiles as fetchPatientMediaFilesData } from "@/lib/media-files/data";
import { db } from "@/database/connection";
import { mediaFiles } from "@/database/schema";

export async function saveMediaFile(
  patientId: string,
  fileUrl: string,
  fileType: string,
  fileName: string,
  description?: string
) {
  try {
    const mediaFile = await db
      .insert(mediaFiles)
      .values({
        patientId,
        url: fileUrl,
        type: fileType,
        notes: description || `Uploaded: ${fileName}`,
      })
      .returning();

    revalidatePath(`/dashboard/patients/${patientId}`);
    return mediaFile[0];
  } catch (error) {
    console.error("Failed to save media file:", error);
    throw new Error("Failed to save media file.");
  }
}

// Export the data function directly instead of wrapping it
export { fetchPatientMediaFilesData as fetchPatientMediaFiles }; 