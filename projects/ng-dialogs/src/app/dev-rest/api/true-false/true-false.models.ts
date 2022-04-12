import { ICellRendererParams } from '@ag-grid-community/core';

export interface TrueFalseParams extends ICellRendererParams {
  value: boolean;
  reverse?: boolean;
  trueIcon?: string;
  falseIcon?: string;
}
