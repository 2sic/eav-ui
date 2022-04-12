import { ICellRendererParams } from '@ag-grid-community/core';

export interface IdFieldParams extends ICellRendererParams {
  tooltipGetter(paramsData: any): string;
}
