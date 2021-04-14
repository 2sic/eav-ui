import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, Input } from '@angular/core';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { WebApiAction } from '../../../app-administration/models/web-api-details';
import { TrueFalseComponent } from './true-false.component';
import { TrueFalseParams } from './true-false-column-params';

@Component({
  selector: 'app-dev-rest-api-action-params',
  templateUrl: './action-params.component.html',
})
export class DevRestApiActionParamsComponent {

  @Input() data: WebApiAction;

  /** AgGrid modules */
  modules = AllCommunityModules;
  /** AgGrid options */
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      trueFalseComponent: TrueFalseComponent,
    },
    columnDefs: [
      {
        headerName: 'Required', field: 'isOptional', headerClass: 'dense', width: 70, cellClass: 'no-padding no-outline',
        cellRenderer: 'trueFalseComponent',
        cellRendererParams: { reverse: true } as TrueFalseParams
      },
      { headerName: 'Name', field: 'name', flex: 2, minWidth: 200, cellClass: 'no-outline' },
      { headerName: 'Type', field: 'type', flex: 2, headerClass: 'dense', cellClass: 'no-outline' },
      { headerName: 'Default Value', field: 'defaultValue', flex: 2, minWidth: 250, cellClass: 'no-outline' },
    ],
  };

  constructor(  ) { }


}
