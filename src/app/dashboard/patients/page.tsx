import { Suspense } from "react";
import { fetchFilteredPatients } from "@/lib/patients/data";
import { CreatePatient } from "@/components/patients/buttons";
import PatientsTable from "@/components/patients/table";
import { PatientsTableSkeleton } from "@/components/skeletons";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const currentPage = Number(params?.page) || 1;

  const patients = await fetchFilteredPatients(query, currentPage);

  return (
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <CreatePatient />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-4"></div>
      <Suspense key={query + currentPage} fallback={<PatientsTableSkeleton />}>
        <PatientsTable patients={patients} />
      </Suspense>
    </div>
  );
}
