"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Hospital } from "@/lib/definitions";
import { DeleteDialog } from "./delete-dialog";

export const columns: ColumnDef<Hospital>[] = [
  {
    accessorKey: "hospitalCode",
    header: "Hospital Code",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("hospitalCode")}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Hospital Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },

  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      return <div>{row.getValue("address") || "N/A"}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      const email = row.original.email;
      return (
        <div>
          <p className="font-medium">{phone || "N/A"}</p>
          <p className="text-sm text-muted-foreground">
            {email || "No email"}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "Actions",
    header: ({ column }) => {
      return <div className="text-right">{column.id}</div>;
    },
    cell: ({ row }) => {
      const hospital = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/hospitals/${hospital.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteDialog 
            hospitalId={hospital.id} 
            hospitalName={hospital.name}
          />
        </div>
      );
    },
  },
]; 