import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

export class AgActionsComponent<TParams extends ICellRendererParams, TData> implements ICellRendererAngularComp {
  item: TData;
  params: TParams;

  constructor() { }

  agInit(params: TParams) {
    this.params = params;
    this.item = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
