import { ICellRendererAngularComp } from '@ag-grid-community/angular';

export abstract class AgActionsAlwaysRefresh implements ICellRendererAngularComp {
  abstract agInit(params: any): void;

  refresh(params?: any): boolean {
    return true;
  }
}
