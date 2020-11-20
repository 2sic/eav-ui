import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DevRestTemplateVars } from '..';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { eavConstants } from '../../shared/constants/eav.constants';

@Component({
  selector: 'app-dev-rest-tab-permissions',
  templateUrl: './dev-rest-tab-permissions.component.html',
  styleUrls: ['./dev-rest-tab-permissions.component.scss']
})
export class DevRestTabPermissionsComponent implements OnInit {

  @Input() data: DevRestTemplateVars;

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

  private targetType = eavConstants.metadata.entity.type;
  private keyType = eavConstants.keyTypes.guid;
  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    ) { }

  ngOnInit(): void {
  }

  openPermissions() {
    this.router.navigate([`permissions/${this.targetType}/${this.keyType}/${this.contentTypeStaticName}`], { relativeTo: this.route });
  }
}
