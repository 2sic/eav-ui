import { ICellRendererParams } from '@ag-grid-community/all-modules';

export interface TrueFalseParams extends ICellRendererParams {
  value: boolean;
  reverse?: boolean;
  trueIcon?: string;
  falseIcon?: string;
}
