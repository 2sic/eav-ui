import { GridOptions } from '@ag-grid-community/core';

export const defaultGridOptions: GridOptions = {
  accentedSort: true,
  animateRows: true,
  enableCellTextSelection: true,
  headerHeight: 32,
  suppressScrollOnNewData: true,
  valueCache: true,
  defaultColDef: { filterParams: { newRowsAction: 'keep' } },
  tooltipShowDelay: 0,
  suppressMovableColumns: true,
} as const;
