import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';

@Component({
  selector: 'app-views-usage-id',
  templateUrl: './views-usage-id.html',
  styleUrls: ['./views-usage-id.scss'],
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ],
})
export class ViewsUsageIdComponent extends AgGridActionsBaseComponent<ViewsUsageIdRow, ViewsUsageIdActions> {

  get tooltip(): string {
    return String(this.params?.value ?? '');
  }

  get id(): string {
    const firstLine = this.tooltip.split('\n')[0] ?? '';
    return firstLine.split(' ')[1] ?? '';
  }
}

type ViewsUsageIdRow = {
  Block?: string;
  Module?: string;
  Page?: string;
};

export interface ViewsUsageIdParams {
  do(verb: ViewsUsageIdActions, data: ViewsUsageIdRow): void;
}

export type ViewsUsageIdActions = 'copy';
