import { fetchPatientById } from "@/lib/patients/actions";
import {
  BreadcrumbNav,
  PatientHeader,
  PatientTabs,
} from "@/app/ui/patient-details";
import { notFound } from "next/navigation";

export default async function PatientViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params;

  const patientData = await fetchPatientById(patientId);

  if (!patientData) {
    notFound();
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto p-6">
      <BreadcrumbNav currentPage="View Patient" />
      <PatientHeader
        firstName={patientData.firstName}
        lastName={patientData.lastName}
        patientCode={patientData.patientCode}
      />
      <PatientTabs patient={patientData} />
    </div>
  );
}
 