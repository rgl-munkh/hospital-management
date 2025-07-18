"use server";

import { db } from "@/database/connection";
import { sql } from "drizzle-orm";
import { patients } from "@/database/schema";
import { desc, eq } from "drizzle-orm";

const ITEMS_PER_PAGE = 10;

export async function fetchPatients() {
  try {
    const data = await db.execute(sql`
      SELECT id, patient_code, first_name, last_name, age, gender, emergency_name, emergency_phone
      FROM patients
      ORDER BY created_at DESC
    `);

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch patients.");
  }
}

export async function fetchFilteredPatients(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  console.log(query, currentPage);

  try {
    const data = await db
      .select()
      .from(patients)
      .where(
        sql`${patients.patientCode} ILIKE ${`%${query}%`} OR
          ${patients.firstName} ILIKE ${`%${query}%`} OR
          ${patients.lastName} ILIKE ${`%${query}%`} OR
          ${patients.emergencyPhone} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(patients.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch patients.");
  }
}

export async function fetchPatientsPages(query: string) {
  try {
    const data = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(
        sql`${patients.patientCode} ILIKE ${`%${query}%`} OR
            ${patients.firstName} ILIKE ${`%${query}%`} OR
            ${patients.lastName} ILIKE ${`%${query}%`} OR
            ${patients.emergencyPhone} ILIKE ${`%${query}%`}`
      );

    const totalPages = Math.ceil(Number(data[0]?.count || 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of patients.");
  }
}

export async function fetchPatientById(id: string) {
  try {
    const data = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch patient.");
  }
}

export async function getPatientCount() {
  try {
    const data = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients);

    return Number(data[0]?.count || 0);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch patient count.");
  }
}
