'use server'

import { db } from "@/database/connection";
import { sql } from "drizzle-orm";
import { hospitals } from "@/database/schema";
import { desc, eq } from "drizzle-orm";

const ITEMS_PER_PAGE = 10;

export async function fetchHospitals() {
  try {
    const data = await db.execute(sql`
      SELECT id, hospital_code, name, address, phone, email, is_active
      FROM hospitals
      ORDER BY created_at DESC
    `);

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch hospitals.");
  }
}

export async function fetchFilteredHospitals(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  console.log(query, currentPage);

  try {
    const data = await db
      .select()
      .from(hospitals)
      .where(
        sql`${hospitals.hospitalCode} ILIKE ${`%${query}%`} OR
            ${hospitals.name} ILIKE ${`%${query}%`} OR
            ${hospitals.address} ILIKE ${`%${query}%`} OR
            ${hospitals.phone} ILIKE ${`%${query}%`} OR
            ${hospitals.email} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(hospitals.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch hospitals.");
  }
}

export async function fetchHospitalsPages(query: string) {
  try {
    const data = await db
      .select({ count: sql<number>`count(*)` })
      .from(hospitals)
      .where(
        sql`${hospitals.hospitalCode} ILIKE ${`%${query}%`} OR
            ${hospitals.name} ILIKE ${`%${query}%`} OR
            ${hospitals.address} ILIKE ${`%${query}%`} OR
            ${hospitals.phone} ILIKE ${`%${query}%`} OR
            ${hospitals.email} ILIKE ${`%${query}%`}`
      );

    const totalPages = Math.ceil(Number(data[0]?.count || 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of hospitals.");
  }
}

export async function fetchHospitalById(id: string) {
  try {
    const data = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id))
      .limit(1);

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch hospital.");
  }
}

export async function getHospitalCount() {
  try {
    const data = await db
      .select({ count: sql<number>`count(*)` })
      .from(hospitals);

    return Number(data[0]?.count || 0);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch hospital count.");
  }
} 