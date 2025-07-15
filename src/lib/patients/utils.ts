import { patients } from "@/database/schema";

export function buildUpdateData(validatedData: Record<string, unknown>) {
  const updateData: Partial<typeof patients.$inferInsert> & {
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  for (const [key, value] of Object.entries(validatedData)) {
    if (value !== "" && value !== null && value !== undefined) {
      (updateData as Record<string, unknown>)[key] = value;
    }
  }

  return updateData;
} 