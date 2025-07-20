import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Orthotics Management System</h1>
        <Link
          href="/dashboard"
          className="text-brand-800 hover:text-brand-600 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
