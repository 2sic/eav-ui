import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DevRestDataTemplateVars, DevRestNavigation } from '..';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';

@Component({
  selector: 'app-dev-rest-tab-permissions',
  templateUrl: './dev-rest-tab-permissions.component.html',
  styleUrls: ['./dev-rest-tab-permissions.component.scss']
})
export class DevRestTabPermissionsComponent implements OnInit {

  @Input() data: DevRestDataTemplateVars;

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

  ngOnInit(): void {
  }

  openPermissions() {
    const contentTypeStaticName = this.route.snapshot.paramMap.get(DevRestNavigation.paramTypeName);
    this.router.navigate([GoToPermissions.goContentType(contentTypeStaticName)], { relativeTo: this.route });
  }
}
