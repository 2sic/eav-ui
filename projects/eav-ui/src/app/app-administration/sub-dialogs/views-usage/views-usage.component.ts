import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
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
import { AsyncPipe } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';

@Component({
    selector: 'app-views-usage',
    templateUrl: './views-usage.component.html',
    styleUrls: ['./views-usage.component.scss'],
    standalone: true,
    imports: [
        SharedComponentsModule,
        MatButtonModule,
        MatIconModule,
        RouterOutlet,
        AgGridModule,
        AsyncPipe,
        SxcGridModule,
    ],
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
          valueGetter: (params) => {
            const data: ViewUsageData = params.data;
            return data.Name;
          },
          cellClass: nameClassGetter,
          onCellClicked: onNameClicked,
        },
        {
          field: 'Language',
          width: 90,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const data: ViewUsageData = params.data;
            return data.Language;
          },
        },
        {
          field: 'Status',
          width: 80,
          cellClass: 'icon no-outline'.split(' '),
          filter: ViewsUsageStatusFilterComponent,
          cellRenderer: statusCellRenderer,
          valueGetter: (params) => {
            const data: ViewUsageData = params.data;
            return data.Status;
          },
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
