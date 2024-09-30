import { GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { ViewUsageData } from '../../models/view-usage-data.model';
import { ViewUsage } from '../../models/view-usage.model';
import { ViewsService } from '../../services/views.service';
// tslint:disable-next-line:max-line-length
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { transient } from '../../../core';
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
  ],
})
export class ViewsUsageComponent implements OnInit {
  gridOptions = this.buildGridOptions();

  viewUsage = signal<ViewUsage>(undefined);
  viewTooltip = signal(undefined);
  data = signal<ViewUsageData[]>(undefined);

  private viewsService = transient(ViewsService);

  constructor(
    private dialog: MatDialogRef<ViewsUsageComponent>,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const viewGuid = this.route.snapshot.paramMap.get('guid');
    this.viewsService.getUsage(viewGuid).subscribe(viewUsages => {

      const viewUsage = viewUsages[0];
      this.viewUsage.set(viewUsage);
      const viewTooltip = `ID: ${viewUsage.Id}\nGUID: ${viewUsage.Guid}`;
      this.viewTooltip.set(viewTooltip);
      const data = buildData(viewUsage);
      this.data.set(data);
    });
  }

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
