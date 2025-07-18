"use client";

import { X } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  columnId: string;
  title: string;
  options: FilterOption[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  filters = [],
}: DataTableToolbarProps<TData>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const isFiltered = table.getState().columnFilters.length > 0;

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={searchPlaceholder}
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(event) => handleSearch(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filters.map((filter) => {
          const column = table.getColumn(filter.columnId);
          if (!column) return null;
          
          return (
            <DataTableFacetedFilter
              key={filter.columnId}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
