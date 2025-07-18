"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileAxis3d } from "lucide-react";
import Link from "next/link";
import { Patient } from "@/lib/definitions";  
import { DeleteDialog } from "./delete-dialog";

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "patientCode",
    header: "Patient Code",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("patientCode")}</div>;
    },
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string;
      const lastName = row.original.lastName;
      return (
        <div>
          {firstName} {lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => {
      const age = row.getValue("age") as number | null;
      return <Badge variant="secondary">{age || "N/A"}</Badge>;
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      return <div>{row.getValue("gender") || "N/A"}</div>;
    },
  },
  {
    accessorKey: "emergencyName",
    header: "Emergency Contact",
    cell: ({ row }) => {
      const emergencyName = row.getValue("emergencyName") as string | null;
      const emergencyPhone = row.original.emergencyPhone;
      return (
        <div>
          <p className="font-medium">{emergencyName || "N/A"}</p>
          <p className="text-sm text-muted-foreground">
            {emergencyPhone || "No phone"}
          </p>
        </div>
      );
    },
  },
  {
    id: "Actions",
    header: ({ column }) => {
      return <div className="text-right">{column.id}</div>;
    },
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/dashboard/patients/${patient.id}/3d-process/upload-mesh`}
            >
              <FileAxis3d className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/patients/${patient.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteDialog
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
          />
        </div>
      );
    },
  },
];
