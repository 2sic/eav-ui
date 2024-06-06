import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Query } from '../../models/query.model';
import { AgActionsComponent } from '../ag-actions';
import { QueriesActionsParams, QueryActions } from './queries-actions';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';

@Component({
    selector: 'app-queries-actions',
    templateUrl: './queries-actions.component.html',
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
        MatBadgeModule,
        MatMenuModule,
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
