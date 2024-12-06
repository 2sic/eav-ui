import { GridOptions } from '@ag-grid-community/core';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WebApiAction, WebApiActionParameters } from '../../../app-administration/models/web-api-details';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { TrueFalseComponent } from '../true-false/true-false.component';
import { TrueFalseParams } from '../true-false/true-false.models';

@Component({
    selector: 'app-dev-rest-api-action-params',
    templateUrl: './action-params.component.html',
    imports: [
        MatIconModule,
        SxcGridModule,
    ]
})
export class DevRestApiActionParamsComponent {
  data = input<WebApiAction>();

  gridOptions = this.buildGridOptions();

  constructor() { }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          field: 'Required',
          headerClass: 'dense',
          width: 80,
          cellClass: 'no-padding no-outline'.split(' '),
          valueGetter: (p: { data: WebApiActionParameters }) => p.data.isOptional,
          cellRenderer: TrueFalseComponent,
          cellRendererParams: (() => {
            const params: TrueFalseParams = {
              reverse: false,
            };
            return params;
          })(),
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 200,
          cellClass: 'no-outline',
          valueGetter: (p: { data: WebApiActionParameters }) => p.data.name,
        },
        {
          field: 'Type',
          flex: 2,
          headerClass: 'dense',
          cellClass: 'no-outline',
          valueGetter: (p: { data: WebApiActionParameters }) => p.data.type,
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Default Value',
          field: 'DefaultValue',
        },
      ],
    };
    return gridOptions;
  }
}
