import { AllCommunityModules, ColDef, GridOptions, ICellRendererParams, Module } from '@ag-grid-community/all-modules';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { TrueFalseParams } from '../action-params/true-false-column-params';
import { TrueFalseComponent } from '../action-params/true-false.component';
import { DevRestApiTemplateVars } from '../api-template-vars';

@Component({
  selector: 'app-dev-api-permissions',
  templateUrl: './permissions.component.html',
})
export class DevRestApiPermissionsComponent implements OnInit, OnChanges {
  @Input() data: DevRestApiTemplateVars;

  gridModules: Module[];
  gridOptions: GridOptions;
  gridItems: ApiPermissionsGridItem[];
  gridHeight: string;

  private booleanColumnDef: ColDef;

  constructor() { }

  ngOnInit() {
    this.gridModules = AllCommunityModules;
    this.booleanColumnDef = {
      headerClass: 'dense', width: 80, cellClass: 'no-outline', cellRenderer: 'trueFalseComponent',
      cellRendererParams: { reverse: false } as TrueFalseParams,
    };
    this.gridOptions = {
      ...defaultGridOptions,
      frameworkComponents: {
        trueFalseComponent: TrueFalseComponent,
      },
      columnDefs: [
        {
          headerName: 'Requirement', field: 'requirement', flex: 2, minWidth: 200, cellClass: 'no-outline',
          cellRenderer: (params: ICellRendererParams) => params.value,
        },
        { ...this.booleanColumnDef, headerName: 'Class', field: 'class' },
        { ...this.booleanColumnDef, headerName: 'Method', field: 'method' },
        { ...this.booleanColumnDef, headerName: 'Effective', field: 'effective' },
        { headerName: 'Comments', field: 'comments', flex: 3, minWidth: 250, cellClass: 'no-outline' },
      ],
    };
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
        class: this.data.details.security.ignoreSecurity,
        method: this.data.selected.security.ignoreSecurity,
        effective: this.data.selected.mergedSecurity.ignoreSecurity,
        comments: 'If this is set all other security checks are skipped',
      },
      {
        requirement: 'Allow Anonymous Use',
        class: this.data.details.security.allowAnonymous,
        method: this.data.selected.security.allowAnonymous,
        effective: this.data.selected.mergedSecurity.allowAnonymous,
        comments: '',
      },
      {
        requirement: 'Require Verification Token',
        class: this.data.details.security.requireVerificationToken,
        method: this.data.selected.security.requireVerificationToken,
        effective: this.data.selected.mergedSecurity.requireVerificationToken,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>view</strong> permissions',
        class: this.data.details.security.view,
        method: this.data.selected.security.view,
        effective: this.data.selected.mergedSecurity.view,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>edit</strong> permissions',
        class: this.data.details.security.edit,
        method: this.data.selected.security.edit,
        effective: this.data.selected.mergedSecurity.edit,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>admin</strong> permissions',
        class: this.data.details.security.admin,
        method: this.data.selected.security.admin,
        effective: this.data.selected.mergedSecurity.admin,
        comments: '',
      },
      {
        requirement: 'Allow users with <strong>super-user</strong> permissions',
        class: this.data.details.security.superUser,
        method: this.data.selected.security.superUser,
        effective: this.data.selected.mergedSecurity.superUser,
        comments: '',
      },
      {
        requirement: 'Require Context',
        class: this.data.details.security.requireContext,
        method: this.data.selected.security.requireContext,
        effective: this.data.selected.mergedSecurity.requireContext,
        comments: 'If required, the context must be included - see also headers',
      },
    ];
    this.gridHeight = `${33 + this.gridItems.length * 48}px`;
  }
}

export interface ApiPermissionsGridItem {
  requirement: string;
  class: boolean;
  method: boolean;
  effective: boolean;
  comments: string;
}
