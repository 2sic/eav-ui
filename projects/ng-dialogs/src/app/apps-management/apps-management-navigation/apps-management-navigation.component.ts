import { Component, OnInit, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppsManagementDialogDataModel } from '../shared/apps-management-dialog-data.model';
import { AppsManagementDialogParamsService } from '../shared/apps-management-dialog-params.service';

@Component({
  selector: 'app-apps-management-navigation',
  templateUrl: './apps-management-navigation.component.html',
  styleUrls: ['./apps-management-navigation.component.scss']
})
export class AppsManagementNavigationComponent implements OnInit {
  tabs = [
    { name: 'Apps', icon: '', url: 'apps' },
    { name: 'Settings', icon: '', url: 'settings' },
    { name: 'Features', icon: '', url: 'features' },
    { name: '2sxc Insights', icon: '', url: 'sxc-insights' },
  ];
  onChangeTab = new EventEmitter();
  tabPath: string;
  onOpenApp = new EventEmitter();
  openedAppId: number;

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavigationComponent>,
    @Inject(MAT_DIALOG_DATA) public appsManagementDialogData: AppsManagementDialogDataModel,
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
  ) { }

  ngOnInit() {
    this.appsManagementDialogParamsService.zoneId = this.appsManagementDialogData.zoneId;
    this.appsManagementDialogData.tabPath$.subscribe(tabPath => {
      console.log('Apps management tab changed:', tabPath);
      this.tabPath = tabPath;
    });
    this.appsManagementDialogParamsService.openedAppId.subscribe(openedAppId => {
      if (openedAppId === this.openedAppId) { return; }
      this.onOpenApp.emit(openedAppId);
    })
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(url: string) {
    this.onChangeTab.emit(url);
  }

}
