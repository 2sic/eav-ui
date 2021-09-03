import { Component } from '@angular/core';
import { Query } from '../../models/query.model';
import { AgActionsComponent } from '../ag-actions';
import { QueriesActionsParams, QueryActions } from './queries-actions';

@Component({
  selector: 'app-queries-actions',
  templateUrl: './queries-actions.component.html',
})
export class QueriesActionsComponent extends AgActionsComponent<QueriesActionsParams, Query> {
  enablePermissions: boolean;

  public actions = QueryActions;

  agInit(params: QueriesActionsParams) {
    super.agInit(params);
    this.enablePermissions = this.params.getEnablePermissions();
  }
}
