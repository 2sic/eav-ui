import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Query } from '../../models/query.model';
import { AgActionsComponent } from '../ag-actions';
import { QueriesActionsParams, QueryActions } from './queries-actions';

@Component({
  selector: 'app-queries-actions',
  templateUrl: './queries-actions.component.html',
})
export class QueriesActionsComponent extends AgActionsComponent<ICellRendererParams & QueriesActionsParams, Query> {
  enablePermissions: boolean;
  actions = QueryActions;

  agInit(params: ICellRendererParams & QueriesActionsParams): void {
    super.agInit(params);
    this.enablePermissions = this.params.getEnablePermissions();
  }
}
