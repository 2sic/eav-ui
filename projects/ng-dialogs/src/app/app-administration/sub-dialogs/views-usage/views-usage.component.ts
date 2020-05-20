import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';

import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { ViewsService } from '../../services/templates.service';
import { ViewUsage } from '../../models/view-usage.model';
import { ViewsUsageIdComponent } from '../../ag-grid-components/views-usage-id/views-usage-id.component';
import { ViewUsageData } from '../../models/view-usage-data.model';
import { buildData } from './views-usage.helpers';
// tslint:disable-next-line:max-line-length
import { blockIdValueGetter, moduleIdValueGetter, pageIdValueGetter, moduleIdClassGetter, pageIdClassGetter, nameClassGetter, onNameClicked, statusCellRenderer } from './views-usage-grid.helpers';
import { ViewsUsageStatusFilterComponent } from '../../ag-grid-components/views-usage-status-filter/views-usage-status-filter.component';

@Component({
  selector: 'app-views-usage',
  templateUrl: './views-usage.component.html',
  styleUrls: ['./views-usage.component.scss']
})
export class ViewsUsageComponent implements OnInit {
  viewUsage: ViewUsage;
  viewTooltip: string;
  data: ViewUsageData[];

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      viewsUsageIdComponent: ViewsUsageIdComponent,
      viewsUsageStatusFilterComponent: ViewsUsageStatusFilterComponent,
    },
    columnDefs: [
      {
        headerName: 'Block', field: 'Block', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'viewsUsageIdComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: blockIdValueGetter,
      },
      {
        headerName: 'Module', field: 'Module', width: 76, headerClass: 'dense', cellRenderer: 'viewsUsageIdComponent',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: moduleIdValueGetter, cellClass: moduleIdClassGetter,
      },
      {
        headerName: 'Page', field: 'PageId', width: 70, headerClass: 'dense', cellRenderer: 'viewsUsageIdComponent',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: pageIdValueGetter, cellClass: pageIdClassGetter,
      },
      {
        headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, sortable: true, filter: 'agTextColumnFilter',
        cellClass: nameClassGetter, onCellClicked: onNameClicked,
      },
      { headerName: 'Language', field: 'Language', width: 90, cellClass: 'no-outline', sortable: true, filter: 'agTextColumnFilter' },
      {
        headerName: 'Status', field: 'Status', width: 80, cellClass: 'icon no-outline', filter: 'viewsUsageStatusFilterComponent',
        cellRenderer: statusCellRenderer,
      },
    ],
  };

  private viewGuid: string;

  constructor(
    private dialogRef: MatDialogRef<ViewsUsageComponent>,
    private route: ActivatedRoute,
    private viewsService: ViewsService,
  ) {
    this.viewGuid = this.route.snapshot.paramMap.get('guid');
  }

  async ngOnInit() {
    this.viewsService.getUsage(this.viewGuid).subscribe(viewUsages => {
      this.viewUsage = viewUsages[0];
      this.viewTooltip = `ID: ${this.viewUsage.Id}\nGUID: ${this.viewUsage.Guid}`;
      this.data = buildData(this.viewUsage);
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
