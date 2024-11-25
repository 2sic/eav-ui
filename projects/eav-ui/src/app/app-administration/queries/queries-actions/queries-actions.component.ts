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

class AgActionsComponent<TParams extends ICellRendererParams, TData> implements ICellRendererAngularComp {
  item: TData;
  params: TParams;

  agInit(params: TParams): void {
    this.params = params;
    this.item = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }
}

@Component({
  selector: 'app-queries-actions',
  templateUrl: './queries-actions.component.html',
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
  ],
})
export class QueriesActionsComponent extends AgActionsComponent<ICellRendererParams & QueriesActionsParams, Query> {
  enablePermissions: boolean;
  actions = QueryActions;

  agInit(params: ICellRendererParams & QueriesActionsParams): void {
    super.agInit(params);
    this.enablePermissions = this.params.getEnablePermissions();
  }
}
