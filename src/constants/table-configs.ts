import { createTableConfig, commonFilters } from "./table-factory";

export const patientTableConfig = createTableConfig(
  "Filter patients...",
  [commonFilters.gender()]
);

export const hospitalTableConfig = createTableConfig(
  "Filter hospitals...",
  [commonFilters.status()]
); 