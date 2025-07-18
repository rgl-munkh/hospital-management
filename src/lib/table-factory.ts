import { FilterConfig } from "@/components/data-table";

export interface TableConfig {
  searchPlaceholder: string;
  filters: FilterConfig[];
}

export function createTableConfig(
  searchPlaceholder: string,
  filters: FilterConfig[] = []
): TableConfig {
  return {
    searchPlaceholder,
    filters,
  };
}

// Helper function to create filter configurations
export function createFilterConfig(
  columnId: string,
  title: string,
  options: Array<{ label: string; value: string }>
): FilterConfig {
  return {
    columnId,
    title,
    options,
  };
}

// Common filter options
export const commonFilters = {
  status: (columnId: string = "isActive") => createFilterConfig(columnId, "Status", [
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ]),
  
  gender: (columnId: string = "gender") => createFilterConfig(columnId, "Gender", [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ]),
  
  type: (columnId: string = "type", options: Array<{ label: string; value: string }>) => 
    createFilterConfig(columnId, "Type", options),
}; 