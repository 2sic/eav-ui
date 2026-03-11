import { GridOptions } from '@ag-grid-community/core';
import { Component, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { transient } from '../../../../../../core';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { ViewsService } from '../../services/views.service';
import { blockIdValueGetter, moduleIdClassGetter, moduleIdValueGetter, nameClassGetter, onNameClicked, pageIdClassGetter, pageIdValueGetter, statusCellRenderer, } from './views-usage-grid.helpers';
import { ViewsUsageIdActions, ViewsUsageIdComponent, } from './views-usage-id/views-usage-id';
import { ViewsUsageStatusFilterComponent } from './views-usage-status-filter/views-usage-status-filter';
import { buildData } from './views-usage.helpers';

@Component({
  selector: 'app-views-usage',
  templateUrl: './views-usage.html',
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    SxcGridModule,
    TippyDirective,
    MatDialogModule,
  ],
})
export class ViewsUsageComponent {
  gridOptions = this.buildGridOptions();

  private viewsService = transient(ViewsService);
  private clipboard = transient(ClipboardService);

  constructor(
    private dialog: MatDialogRef<ViewsUsageComponent>,
    private route: ActivatedRoute,
  ) { }

  viewGuid = this.route.snapshot.paramMap.get('guid');

  #usage = this.viewsService.getUsage(this.viewGuid).value;

  view = computed(() => {
    const usage = this.#usage();
    if (usage === undefined) {
      return undefined;
    }

    return {
      viewUsageName: usage[0]?.Name,
      viewTooltip: `ID: ${usage[0].Id}\nGUID: ${usage[0].Guid}`,
      data: buildData(usage[0]),
    };
  });

  closeDialog(): void {
    this.dialog.close();
  }

  private onIdAction(
    verb: ViewsUsageIdActions,
    data: {
      Block?: string;
      Module?: string;
      Page?: string;
    },
  ): void {
    switch (verb) {
      case 'copy':return this.clipboard.copyToClipboard(String(data)); }
  }

  private buildGridOptions(): GridOptions {
    return {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.Id,
          field: 'Block',
          valueGetter: blockIdValueGetter,
          cellRenderer: ViewsUsageIdComponent,
          cellRendererParams: {
            do: (verb, data) => this.onIdAction(verb, data),
          } satisfies ViewsUsageIdComponent['params'],
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Module',
          width: 80,
          valueGetter: moduleIdValueGetter,
          cellClass: moduleIdClassGetter,
          cellRenderer: ViewsUsageIdComponent,
          cellRendererParams: {
            do: (verb, data) => this.onIdAction(verb, data),
          } satisfies ViewsUsageIdComponent['params'],
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Page',
          valueGetter: pageIdValueGetter,
          cellClass: pageIdClassGetter,
          cellRenderer: ViewsUsageIdComponent,
          cellRendererParams: {
            do: (verb, data) => this.onIdAction(verb, data),
          } satisfies ViewsUsageIdComponent['params'],
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          sort: 'asc',
          cellClass: nameClassGetter,
          onCellClicked: onNameClicked,
        },
        {
          ...ColumnDefinitions.ItemsText,
          field: 'Language',
          width: 90,
        },
        {
          field: 'Status',
          width: 80,
          cellClass: 'icon no-outline'.split(' '),
          filter: ViewsUsageStatusFilterComponent,
          cellRenderer: statusCellRenderer,
        },
      ],
    };
  }
}