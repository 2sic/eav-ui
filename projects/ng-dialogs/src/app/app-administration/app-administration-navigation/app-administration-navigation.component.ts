import { Component, OnInit, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AppAdministrationDialogDataModel } from '../shared/app-administration-dialog-data.model';

@Component({
  selector: 'app-app-administration-navigation',
  templateUrl: './app-administration-navigation.component.html',
  styleUrls: ['./app-administration-navigation.component.scss']
})
export class AppAdministrationNavigationComponent implements OnInit, OnDestroy {
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
  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavigationComponent>,
    @Inject(MAT_DIALOG_DATA) public appAdministrationDialogData: AppAdministrationDialogDataModel,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.appAdministrationDialogData.tabPath$.subscribe(tabPath => {
        console.log('App administration tab changed:', tabPath);
        this.tabPath = tabPath;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
    this.onChangeTab.complete();
    this.onChangeTab = null;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(url: string) {
    this.onChangeTab.emit(url);
  }
}
