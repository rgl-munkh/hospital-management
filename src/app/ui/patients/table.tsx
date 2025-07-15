"use client";

import { DataTable } from "@/app/ui/data-table";
import { columns } from "./columns";
import { Patient } from "@/lib/definitions";

interface PatientsTableProps {
  patients: Patient[];
}

export default function PatientsTable({ patients }: PatientsTableProps) {
  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={patients} />
    </div>
  );
}
