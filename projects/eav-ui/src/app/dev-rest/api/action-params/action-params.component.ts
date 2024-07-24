import { GridOptions } from '@ag-grid-community/core';
import { Component, Input } from '@angular/core';
import { WebApiAction, WebApiActionParameters } from '../../../app-administration/models/web-api-details';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { TrueFalseComponent } from '../true-false/true-false.component';
import { TrueFalseParams } from '../true-false/true-false.models';
import { MatIconModule } from '@angular/material/icon';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';

@Component({
  selector: 'app-dev-rest-api-action-params',
  templateUrl: './action-params.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    SxcGridModule,
  ],
})
export class DevRestApiActionParamsComponent {
  @Input() data: WebApiAction;

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
          valueGetter: (params) => {
            const action: WebApiActionParameters = params.data;
            return action.isOptional;
          },
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
          valueGetter: (params) => {
            const action: WebApiActionParameters = params.data;
            return action.name;
          },
        },
        {
          field: 'Type',
          flex: 2,
          headerClass: 'dense',
          cellClass: 'no-outline',
          valueGetter: (params) => {
            const action: WebApiActionParameters = params.data;
            return action.type;
          },
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
