import { GridOptions } from '@ag-grid-community/core';
import { Component, input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DevRestApiModel } from '../api-template-vars';

@Component({
    selector: 'app-dev-api-permissions',
    templateUrl: './permissions.html',
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
        class: this.data().details?.IgnoreSecurity ?? false,
        method: this.data().selected?.Security?.ignoreSecurity ?? false,
        effective: this.data().selected?.IgnoreSecurity ?? false,
        comments: 'If this is set all other security checks are skipped',
      },
      {
        requirement: 'Allow Anonymous Use',
        class: this.data().details?.AllowAnonymous ?? false,
        method: this.data().selected?.Security?.allowAnonymous ?? false,
        effective: this.data().selected?.AllowAnonymous ?? false,
        comments: '',
      },
      {
        requirement: 'Require Verification Token',
        class: this.data().details?.RequireVerificationToken ?? false,
        method: this.data().selected?.Security?.requireVerificationToken ?? false,
        effective: this.data().selected?.RequireVerificationToken ?? false,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>view</strong> permissions',
        class: this.data().details?.View ?? false,
        method: this.data().selected?.Security?.view ?? false,
        effective: this.data().selected?.View ?? false,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>edit</strong> permissions',
        class: this.data().details?.Edit ?? false,
        method: this.data().selected?.Security?.edit ?? false,
        effective: this.data().selected?.Edit ?? false,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>admin</strong> permissions',
        class: this.data().details?.Admin ?? false,
        method: this.data().selected?.Security?.admin ?? false,
        effective: this.data().selected?.Admin ?? false,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>super-user</strong> permissions',
        class: this.data().details?.SuperUser ?? false,
        method: this.data().selected?.Security?.superUser ?? false,
        effective: this.data().selected?.SuperUser ?? false,
        comments: '',
      },
      {
        requirement: 'Require Context',
        class: this.data().details?.RequireContext ?? false,
        method: this.data().selected?.Security?.requireContext ?? false,
        effective: this.data().selected?.RequireContext ?? false,
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
