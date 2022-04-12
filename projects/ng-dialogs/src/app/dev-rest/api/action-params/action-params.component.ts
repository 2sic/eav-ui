import { GridOptions } from '@ag-grid-community/core';
import { Component, Input } from '@angular/core';
import { WebApiAction, WebApiActionParameters } from '../../../app-administration/models/web-api-details';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { TrueFalseComponent } from '../true-false/true-false.component';
import { TrueFalseParams } from '../true-false/true-false.models';

@Component({
  selector: 'app-dev-rest-api-action-params',
  templateUrl: './action-params.component.html',
})
export class DevRestApiActionParamsComponent {
  @Input() data: WebApiAction;

  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: [
      {
        field: 'Required', headerClass: 'dense', width: 80, cellClass: 'no-padding no-outline'.split(' '),
        valueGetter: (params) => (params.data as WebApiActionParameters).isOptional,
        cellRenderer: TrueFalseComponent,
        cellRendererParams: { reverse: true } as TrueFalseParams,
      },
      {
        field: 'Name', flex: 2, minWidth: 200, cellClass: 'no-outline',
        valueGetter: (params) => (params.data as WebApiActionParameters).name,
      },
      {
        field: 'Type', flex: 2, headerClass: 'dense', cellClass: 'no-outline',
        valueGetter: (params) => (params.data as WebApiActionParameters).type,
      },
      {
        headerName: 'Default Value', field: 'DefaultValue', flex: 2, minWidth: 250, cellClass: 'no-outline',
        valueGetter: (params) => (params.data as WebApiActionParameters).defaultValue,
      },
    ],
  };

  constructor() { }

}
