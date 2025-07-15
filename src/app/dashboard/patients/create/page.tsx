import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";
import { CreateForm } from "@/components/patient-create/create-form";

export default function CreatePatientPage() {
  return (
    <div className="space-y-6 w-2/3 mx-auto mt-10">
      <Breadcrumb
        paths={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/dashboard/patients" },
          { label: "Create Patient", href: "/dashboard/patients/create" },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Patient Details</CardTitle>
          <CardDescription>Enter the basic patient information</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
