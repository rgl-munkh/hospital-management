import { Suspense } from "react";
import { fetchFilteredPatients } from "@/lib/patients/data";
import { lusitana } from "@/app/ui/fonts";
import { CreatePatient } from "@/app/ui/patients/buttons";
import PatientsTable from "@/app/ui/patients/table";
import { PatientsTableSkeleton } from "@/app/ui/skeletons";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  const patients = await fetchFilteredPatients(query, currentPage);

  return (
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Patients</h1>
        <CreatePatient />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-4"></div>
      <Suspense key={query + currentPage} fallback={<PatientsTableSkeleton />}>
        <PatientsTable patients={patients} />
      </Suspense>
    </div>
  );
}
