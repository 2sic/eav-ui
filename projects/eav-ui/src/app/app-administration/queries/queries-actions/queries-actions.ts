import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { Query } from '../../models/query.model';
import { QueriesActionsParams, QueryActions } from './queries-actions-models';

@Component({
  selector: 'app-queries-actions',
  templateUrl: './queries-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
  ]
})
export class QueriesActionsComponent
  extends AgGridActionsBaseComponent<Query, QueryActions, QueriesActionsParams> {

  actions = QueryActions;

  get enablePermissions() { return this.params.getEnablePermissions(); }
}