import { ICellRendererParams } from '@ag-grid-community/core';

/** Generic pattern to provide actions with less ceremony */
export interface IAgActions<TAction, TData> extends ICellRendererParams {
  do(action: TAction, query: TData): void;
}
