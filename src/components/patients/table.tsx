"use client";

import { GenericTable } from "@/components/generic-table";
import { columns } from "./columns";
import { Patient } from "@/lib/definitions";
import { patientTableConfig } from "@/lib/table-configs";

interface PatientsTableProps {
  patients: Patient[];
}

export default function PatientsTable({ patients }: PatientsTableProps) {
  return <GenericTable columns={columns} data={patients} config={patientTableConfig} />;
}
