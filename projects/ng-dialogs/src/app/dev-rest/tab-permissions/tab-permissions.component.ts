import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DevRestBaseTemplateVars } from '..';
import { Permission } from '../../permissions';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';

@Component({
  selector: 'app-dev-rest-tab-permissions',
  templateUrl: './tab-permissions.component.html',
})
export class DevRestTabPermissionsComponent {

  @Input() data: DevRestBaseTemplateVars;

  /** AgGrid modules */
  modules = AllCommunityModules;
  /** AgGrid options */
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'no-padding no-outline',
        valueGetter: (params) => (params.data as Permission).Id,
      },
      {
        field: 'Name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        valueGetter: (params) => (params.data as Permission).Title,
      },
      {
        field: 'Identity', flex: 2, minWidth: 250, cellClass: 'no-outline',
        valueGetter: (params) => (params.data as Permission).Identity,
      },
      {
        field: 'Condition', flex: 2, minWidth: 250, cellClass: 'no-outline',
        valueGetter: (params) => (params.data as Permission).Condition,
      },
      {
        field: 'Grant', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        valueGetter: (params) => (params.data as Permission).Grant,
      },
    ],
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  openPermissions() {
    this.router.navigate([GoToPermissions.getUrlContentType(this.data.permissionTarget)], { relativeTo: this.route });
  }
}
