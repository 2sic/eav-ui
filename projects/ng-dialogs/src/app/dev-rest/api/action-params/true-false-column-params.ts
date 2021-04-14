import { ICellRendererParams } from '@ag-grid-community/all-modules';

export interface TrueFalseParams extends ICellRendererParams {
  reverse?: boolean;
  trueIcon?: string;
  falseIcon?: string;
}
