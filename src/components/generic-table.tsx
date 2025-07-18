"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TableConfig } from "@/lib/table-factory";

interface GenericTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config: TableConfig;
}

export function GenericTable<TData, TValue>({
  columns,
  data,
  config,
}: GenericTableProps<TData, TValue>) {
  return (
    <div className="space-y-4">
      <DataTable 
        columns={columns} 
        data={data} 
        searchPlaceholder={config.searchPlaceholder}
        filters={config.filters}
      />
    </div>
  );
} 