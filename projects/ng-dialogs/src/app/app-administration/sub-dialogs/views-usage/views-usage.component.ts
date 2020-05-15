import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';

@Component({
  selector: 'app-views-usage',
  templateUrl: './views-usage.component.html',
  styleUrls: ['./views-usage.component.scss']
})
export class ViewsUsageComponent implements OnInit {
  data: any;

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: [
    ],
  };

  constructor(private dialogRef: MatDialogRef<ViewsUsageComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
