import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { Query } from '../../models/query.model';
import { QueriesActionsParams, QueryActions } from './queries-actions';

@Component({
    selector: 'app-queries-actions',
    templateUrl: './queries-actions.component.html',
    imports: [
        MatRippleModule,
        MatIconModule,
        MatBadgeModule,
        MatMenuModule,
        TippyDirective,
    ]
})
export class QueriesActionsComponent implements ICellRendererAngularComp {
  item: Query;
  params: ICellRendererParams & QueriesActionsParams;
  enablePermissions: boolean;
  actions = QueryActions;

  agInit(params: ICellRendererParams & QueriesActionsParams): void {
    this.params = params;
    this.item = this.params.data;
    this.enablePermissions = this.params.getEnablePermissions();
  }

  refresh(params?: any): boolean {
    return true;
  }
}
