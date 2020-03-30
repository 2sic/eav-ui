import { ColDef } from '@ag-grid-community/all-modules';

export interface ExtendedColDef extends ColDef {
  /** For entity field */
  allowMultiValue?: boolean;
  /** For datetime field */
  useTimePicker?: boolean;
}
