import { GridOptions } from '@ag-grid-community/core';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DevRestBaseViewModel } from '..';
import { Permission } from '../../permissions';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TippyStandaloneDirective } from '../../shared/directives/tippy-Standalone.directive';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';

@Component({
    selector: 'app-dev-rest-tab-permissions',
    templateUrl: './tab-permissions.component.html',
    standalone: true,
    imports: [
        MatButtonModule,
        TippyStandaloneDirective,
        MatIconModule,
        MatBadgeModule,
        AgGridModule,
    ],
})
export class DevRestTabPermissionsComponent {
  @Input() data: DevRestBaseViewModel;

  gridOptions = this.buildGridOptions();

  constructor(private router: Router, private route: ActivatedRoute) { }

  openPermissions() {
    this.router.navigate([GoToPermissions.getUrlContentType(this.data.permissionTarget)], { relativeTo: this.route });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.Id
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Name',
          field: 'Title',
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Identity',
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Condition',
        },
        {
          field: 'Grant',
          width: 70,
          headerClass: 'dense',
          cellClass: 'no-outline',
        },
      ],
    };
    return gridOptions;
  }
}
