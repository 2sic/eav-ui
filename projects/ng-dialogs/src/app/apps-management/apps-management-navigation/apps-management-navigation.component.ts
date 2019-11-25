import { Component, OnInit, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppsManagementDialogDataModel } from '../shared/apps-management-dialog-data.model';

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
  onOpenApp = new EventEmitter();
  tab: string;

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavigationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppsManagementDialogDataModel,
  ) { }

  ngOnInit() {
    this.data.tab$.subscribe(tab => {
      console.log('Apps management tab changed:', tab);
      this.tab = tab;
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(url: string) {
    this.onChangeTab.emit(url);
  }

  openApp(appId: number) {
    this.onOpenApp.emit(appId);
  }
}
