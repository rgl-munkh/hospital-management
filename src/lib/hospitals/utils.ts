import { z } from "zod";
import { updateHospitalSchema } from "./schemas";

type UpdateHospitalData = z.infer<typeof updateHospitalSchema>;

export function buildUpdateData(data: UpdateHospitalData) {
  const updateData: Record<string, string | boolean | undefined> = {};

  if (data.hospitalCode !== undefined && data.hospitalCode.trim() !== "") {
    updateData.hospitalCode = data.hospitalCode;
  }
  if (data.name !== undefined && data.name.trim() !== "") {
    updateData.name = data.name;
  }
  if (data.address !== undefined) {
    updateData.address = data.address;
  }
  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }
  if (data.email !== undefined) {
    updateData.email = data.email;
  }
  if (data.website !== undefined) {
    updateData.website = data.website;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  return updateData;
} 