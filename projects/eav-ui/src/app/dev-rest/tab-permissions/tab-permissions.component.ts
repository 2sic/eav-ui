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
          headerName: 'ID',
          field: 'Id',
          width: 70,
          headerClass: 'dense',
          cellClass: 'no-padding no-outline'.split(' '),
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Id;
          },
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Title;
          },
        },
        {
          field: 'Identity',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Identity;
          },
        },
        {
          field: 'Condition',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Condition;
          },
        },
        {
          field: 'Grant',
          width: 70,
          headerClass: 'dense',
          cellClass: 'no-outline',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Grant;
          },
        },
      ],
    };
    return gridOptions;
  }
}
