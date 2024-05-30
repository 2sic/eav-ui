import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { ViewUsageData } from '../../models/view-usage-data.model';
import { ViewUsage } from '../../models/view-usage.model';
import { ViewsService } from '../../services/views.service';
// tslint:disable-next-line:max-line-length
import { blockIdValueGetter, moduleIdClassGetter, moduleIdValueGetter, nameClassGetter, onNameClicked, pageIdClassGetter, pageIdValueGetter, statusCellRenderer } from './views-usage-grid.helpers';
import { ViewsUsageIdComponent } from './views-usage-id/views-usage-id.component';
import { ViewsUsageStatusFilterComponent } from './views-usage-status-filter/views-usage-status-filter.component';
import { buildData } from './views-usage.helpers';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';

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

  viewModel$: Observable<ViewsUsageViewModel>;

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

    this.viewModel$ = combineLatest([this.viewUsage$, this.viewTooltip$, this.data$]).pipe(
      map(([viewUsage, viewTooltip, data]) => ({ viewUsage, viewTooltip, data }))
    );
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
          field: 'Language',
          width: 90,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
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

interface ViewsUsageViewModel {
  viewUsage: ViewUsage;
  viewTooltip: any;
  data: ViewUsageData[];
}
