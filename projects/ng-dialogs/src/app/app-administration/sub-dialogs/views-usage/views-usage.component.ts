import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { ViewUsageData } from '../../models/view-usage-data.model';
import { ViewUsage } from '../../models/view-usage.model';
import { ViewsService } from '../../services/views.service';
// tslint:disable-next-line:max-line-length
import { blockIdValueGetter, moduleIdClassGetter, moduleIdValueGetter, nameClassGetter, onNameClicked, pageIdClassGetter, pageIdValueGetter, statusCellRenderer } from './views-usage-grid.helpers';
import { ViewsUsageIdComponent } from './views-usage-id/views-usage-id.component';
import { ViewsUsageStatusFilterComponent } from './views-usage-status-filter/views-usage-status-filter.component';
import { buildData } from './views-usage.helpers';

@Component({
  selector: 'app-views-usage',
  templateUrl: './views-usage.component.html',
  styleUrls: ['./views-usage.component.scss'],
})
export class ViewsUsageComponent implements OnInit, OnDestroy {
  viewUsage$ = new BehaviorSubject<ViewUsage>(undefined);
  viewTooltip$ = new BehaviorSubject(undefined);
  data$ = new BehaviorSubject<ViewUsageData[]>(undefined);
  gridOptions = this.buildGridOptions();

  constructor(private dialogRef: MatDialogRef<ViewsUsageComponent>, private route: ActivatedRoute, private viewsService: ViewsService) { }

  ngOnInit() {
    const viewGuid = this.route.snapshot.paramMap.get('guid');
    this.viewsService.getUsage(viewGuid).subscribe(viewUsages => {
      const viewUsage = viewUsages[0];
      this.viewUsage$.next(viewUsage);
      const viewTooltip = `ID: ${viewUsage.Id}\nGUID: ${viewUsage.Guid}`;
      this.viewTooltip$.next(viewTooltip);
      const data = buildData(viewUsage);
      this.data$.next(data);
    });
  }

  ngOnDestroy() {
    this.viewUsage$.complete();
    this.viewTooltip$.complete();
    this.data$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          field: 'Block',
          width: 70,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: blockIdValueGetter,
          cellRenderer: ViewsUsageIdComponent,
        },
        {
          field: 'Module',
          width: 76,
          headerClass: 'dense',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: moduleIdValueGetter,
          cellClass: moduleIdClassGetter,
          cellRenderer: ViewsUsageIdComponent,
        },
        {
          field: 'Page',
          width: 70,
          headerClass: 'dense',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: pageIdValueGetter,
          cellClass: pageIdClassGetter,
          cellRenderer: ViewsUsageIdComponent,
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          valueGetter: (params) => (params.data as ViewUsageData).Name,
          cellClass: nameClassGetter,
          onCellClicked: onNameClicked,
        },
        {
          field: 'Language',
          width: 90,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => (params.data as ViewUsageData).Language,
        },
        {
          field: 'Status',
          width: 80,
          cellClass: 'icon no-outline'.split(' '),
          filter: ViewsUsageStatusFilterComponent,
          cellRenderer: statusCellRenderer,
          valueGetter: (params) => (params.data as ViewUsageData).Status,
        },
      ],
    };
    return gridOptions;
  }
}
