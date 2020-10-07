import { ICellRendererParams } from '@ag-grid-community/all-modules';

export interface IdFieldParams extends ICellRendererParams {
  tooltipGetter(paramsData: any): string;
}
