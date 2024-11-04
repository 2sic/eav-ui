import { GridOptions } from '@ag-grid-community/core';
import { Component, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DevRestBaseModel } from '..';
import { transient } from '../../../../../core';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-dev-rest-tab-permissions',
  templateUrl: './tab-permissions.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    TippyDirective,
    MatIconModule,
    MatBadgeModule,
    SxcGridModule,
  ],
})
export class DevRestTabPermissionsComponent {
  data = input<DevRestBaseModel>();

  #dialogRouter = transient(DialogRoutingService);

  gridOptions = this.buildGridOptions();

  openPermissions() {
    this.#dialogRouter.navRelative([GoToPermissions.getUrlContentType(this.data().permissionTarget)]);
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
