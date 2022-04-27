import { ColDef } from '@ag-grid-community/core';

export interface ExtendedColDef extends ColDef {
  /** For entity field */
  allowMultiValue?: boolean;
  /** For datetime field */
  useTimePicker?: boolean;
}
