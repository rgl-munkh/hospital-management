import { fetchPatientById } from "@/lib/patients";
import { PatientHeader, PatientTabs } from "@/components/patient-details";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function PatientViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params;

  const patientData = await fetchPatientById(patientId);

  if (!patientData) return notFound();

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto p-6">
      <Breadcrumb
        paths={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/dashboard/patients" },
          { label: "View Patient", href: `/dashboard/patients/${patientId}` },
        ]}
      />
      <PatientHeader
        firstName={patientData.firstName}
        lastName={patientData.lastName}
        patientCode={patientData.patientCode}
      />
      <PatientTabs patient={patientData} />
    </div>
  );
}
