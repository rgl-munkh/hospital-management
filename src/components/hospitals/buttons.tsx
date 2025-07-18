"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function CreateHospital() {
  return (
    <Button asChild>
      <Link href="/dashboard/hospitals/create">
        <Plus className="mr-2 h-4 w-4" />
        Add Hospital
      </Link>
    </Button>
  );
} 