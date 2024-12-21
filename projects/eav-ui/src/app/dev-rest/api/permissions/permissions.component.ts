import { GridOptions } from '@ag-grid-community/core';
import { Component, input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DevRestApiModel } from '../api-template-vars';

@Component({
    selector: 'app-dev-api-permissions',
    templateUrl: './permissions.component.html',
    imports: [SxcGridModule,]
})
export class DevRestApiPermissionsComponent implements OnInit, OnChanges {
  data = input<DevRestApiModel>();

  gridOptions: GridOptions;
  gridItems: ApiPermissionsGridItem[];
  gridHeight: string;

  constructor() { }

  ngOnInit() {
    this.gridOptions = this.buildGridOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.buildGridItems();
    }
  }

  private buildGridItems() {
    this.gridItems = [
      {
        requirement: 'Ignore All Security Checks <code>[AllowAnonymous]</code>',
        class: this.data().details.security.ignoreSecurity,
        method: this.data().selected.security.ignoreSecurity,
        effective: this.data().selected.mergedSecurity.ignoreSecurity,
        comments: 'If this is set all other security checks are skipped',
      },
      {
        requirement: 'Allow Anonymous Use',
        class: this.data().details.security.allowAnonymous,
        method: this.data().selected.security.allowAnonymous,
        effective: this.data().selected.mergedSecurity.allowAnonymous,
        comments: '',
      },
      {
        requirement: 'Require Verification Token',
        class: this.data().details.security.requireVerificationToken,
        method: this.data().selected.security.requireVerificationToken,
        effective: this.data().selected.mergedSecurity.requireVerificationToken,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>view</strong> permissions',
        class: this.data().details.security.view,
        method: this.data().selected.security.view,
        effective: this.data().selected.mergedSecurity.view,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>edit</strong> permissions',
        class: this.data().details.security.edit,
        method: this.data().selected.security.edit,
        effective: this.data().selected.mergedSecurity.edit,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>admin</strong> permissions',
        class: this.data().details.security.admin,
        method: this.data().selected.security.admin,
        effective: this.data().selected.mergedSecurity.admin,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>super-user</strong> permissions',
        class: this.data().details.security.superUser,
        method: this.data().selected.security.superUser,
        effective: this.data().selected.mergedSecurity.superUser,
        comments: '',
      },
      {
        requirement: 'Require Context',
        class: this.data().details.security.requireContext,
        method: this.data().selected.security.requireContext,
        effective: this.data().selected.mergedSecurity.requireContext,
        comments: 'If required, the context must be included - see also headers',
      },
    ];
    this.gridHeight = `${33 + this.gridItems.length * 48}px`;
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'Requirement',
          field: 'requirement',
          flex: 2,
          minWidth: 200,
          cellClass: 'no-outline',
        },
        {
          ...ColumnDefinitions.Boolean3,
          headerName: 'Class',
          field: 'class',
        },
        {
          ...ColumnDefinitions.Boolean3,
          headerName: 'Method',
          field: 'method',
        },
        {
          ...ColumnDefinitions.Boolean3,
          headerName: 'Effective',
          field: 'effective',
        },
        {
          ...ColumnDefinitions.TextWideFlex3,
          headerName: 'Comments',
          field: 'comments',
        },
      ],
    };
    return gridOptions;
  }
}

export interface ApiPermissionsGridItem {
  requirement: string;
  class: boolean;
  method: boolean;
  effective: boolean;
  comments: string;
}
