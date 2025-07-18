"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Patient } from "@/lib/definitions";
import { patientTableConfig } from "@/lib/table-configs";

interface PatientsTableProps {
  patients: Patient[];
}

export default function PatientsTable({ patients }: PatientsTableProps) {
  return <DataTable columns={columns} data={patients} config={patientTableConfig} />;
}
