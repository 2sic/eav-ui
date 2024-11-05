import { GridOptions } from '@ag-grid-community/core';
import { Component, computed } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { ViewsService } from '../../services/views.service';
// tslint:disable-next-line:max-line-length
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { transient } from '../../../../../../core';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { blockIdValueGetter, moduleIdClassGetter, moduleIdValueGetter, nameClassGetter, onNameClicked, pageIdClassGetter, pageIdValueGetter, statusCellRenderer } from './views-usage-grid.helpers';
import { ViewsUsageIdComponent } from './views-usage-id/views-usage-id.component';
import { ViewsUsageStatusFilterComponent } from './views-usage-status-filter/views-usage-status-filter.component';
import { buildData } from './views-usage.helpers';

@Component({
  selector: 'app-views-usage',
  templateUrl: './views-usage.component.html',
  standalone: true,
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

  constructor(
    private dialog: MatDialogRef<ViewsUsageComponent>,
    private route: ActivatedRoute,
  ) { }

  viewGuid = this.route.snapshot.paramMap.get('guid');

  #usage = this.viewsService.getUsage(this.viewGuid);

  view = computed(() => {
    const usage = this.#usage();
    if (usage === undefined)
      return undefined;

    return {
      viewUsageName: usage[0]?.Name,
      viewTooltip: `ID: ${usage[0].Id}\nGUID: ${usage[0].Guid}`,
      data: buildData(usage[0]),
    }
  }
  );


  closeDialog() {
    this.dialog.close();
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.Id,
          field: 'Block',
          valueGetter: blockIdValueGetter,
          cellRenderer: ViewsUsageIdComponent,
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Module',
          width: 80,
          valueGetter: moduleIdValueGetter,
          cellClass: moduleIdClassGetter,
          cellRenderer: ViewsUsageIdComponent,
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Page',
          valueGetter: pageIdValueGetter,
          cellClass: pageIdClassGetter,
          cellRenderer: ViewsUsageIdComponent,
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
    return gridOptions;
  }
}
