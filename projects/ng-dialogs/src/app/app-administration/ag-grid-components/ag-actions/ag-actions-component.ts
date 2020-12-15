import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

export class AgActionsComponent<TParams extends ICellRendererParams, TData> implements ICellRendererAngularComp {
  public item: TData;
  public params: TParams;

  constructor() { }

  agInit(params: TParams) {
    this.params = params;
    this.item = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

}
