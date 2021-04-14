import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DevRestBaseTemplateVars } from '..';
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
      { headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'no-padding no-outline' },
      { headerName: 'Name', field: 'Title', flex: 2, minWidth: 250, cellClass: 'no-outline' },
      { headerName: 'Identity', field: 'Identity', flex: 2, minWidth: 250, cellClass: 'no-outline' },
      { headerName: 'Condition', field: 'Condition', flex: 2, minWidth: 250, cellClass: 'no-outline' },
      { headerName: 'Grant', field: 'Grant', width: 70, headerClass: 'dense', cellClass: 'no-outline' },
    ],
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }


  openPermissions() {
    this.router.navigate([GoToPermissions.goContentType(this.data.permissionTarget)], { relativeTo: this.route });
  }
}
