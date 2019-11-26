import { Component, OnInit, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppAdministrationDialogDataModel } from '../shared/app-administration-dialog-data.model';

@Component({
  selector: 'app-app-administration-navigation',
  templateUrl: './app-administration-navigation.component.html',
  styleUrls: ['./app-administration-navigation.component.scss']
})
export class AppAdministrationNavigationComponent implements OnInit {
  tabs = [
    { name: 'Home', icon: '', url: 'home' },
    { name: 'Data', icon: '', url: 'data' },
    { name: 'Queries', icon: '', url: 'queries' },
    { name: 'Views', icon: '', url: 'views' },
    { name: 'WebApi', icon: '', url: 'web-api' },
    { name: 'App', icon: '', url: 'app' },
    { name: 'Global', icon: '', url: 'global' },
  ];
  onChangeTab = new EventEmitter();
  tabPath: string;

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavigationComponent>,
    @Inject(MAT_DIALOG_DATA) public appAdministrationDialogData: AppAdministrationDialogDataModel,
  ) { }

  ngOnInit() {
    this.appAdministrationDialogData.tabPath$.subscribe(tabPath => {
      console.log('App administration tab changed:', tabPath);
      this.tabPath = tabPath;
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(url: string) {
    this.onChangeTab.emit(url);
  }
}
