import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CreatePatient() {
  return (
    <Button>
      <Link href="/dashboard/patients/create" className="flex items-center">
        <Plus className="mr-2 h-4 w-4" />
        Create Patient
      </Link>
    </Button>
  );
}
