import { Suspense } from "react";
import { fetchFilteredHospitals } from "@/lib/hospitals/data";
import { CreateHospital } from "@/components/hospitals/buttons";
import HospitalsTable from "@/components/hospitals/table";
import { HospitalsTableSkeleton } from "@/components/skeletons";

export default async function HospitalsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  const hospitals = await fetchFilteredHospitals(query, currentPage);

  return (
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Hospitals</h1>
        <CreateHospital />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-4"></div>
      <Suspense key={query + currentPage} fallback={<HospitalsTableSkeleton />}>
        <HospitalsTable hospitals={hospitals} />
      </Suspense>
    </div>
  );
}
