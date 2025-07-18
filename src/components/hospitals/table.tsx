"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Hospital } from "@/lib/definitions";
import { hospitalTableConfig } from "@/lib/table-configs";

interface HospitalsTableProps {
  hospitals: Hospital[];
}

export default function HospitalsTable({ hospitals }: HospitalsTableProps) {
  return <DataTable columns={columns} data={hospitals} config={hospitalTableConfig} />;
} 