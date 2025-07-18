import { Breadcrumb } from "@/components/breadcrumb";
import { CreateForm } from "@/components/hospital-create/create-form";

export default function CreateHospitalPage() {
  return (
    <div className="w-full p-6">
      <Breadcrumb
        paths={[
          { label: "Hospitals", href: "/dashboard/hospitals" },
          { label: "Create Hospital", href: "/dashboard/hospitals/create" },
        ]}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Hospital</h1>
        <p className="text-muted-foreground">
          Add a new hospital to the system.
        </p>
      </div>
      <div className="max-w-2xl">
        <CreateForm />
      </div>
    </div>
  );
}
