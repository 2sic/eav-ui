import { Component, OnInit, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { AppsManagementDialogDataModel } from '../shared/apps-management-dialog-data.model';
import { AppsManagementDialogParamsService } from '../shared/apps-management-dialog-params.service';

@Component({
  selector: 'app-apps-management-navigation',
  templateUrl: './apps-management-navigation.component.html',
  styleUrls: ['./apps-management-navigation.component.scss']
})
export class AppsManagementNavigationComponent implements OnInit, OnDestroy {
  tabs = [
    { name: 'Apps', icon: '', url: 'list' },
    { name: 'Settings', icon: '', url: 'settings' },
    { name: 'Features', icon: '', url: 'features' },
    { name: '2sxc Insights', icon: '', url: 'sxc-insights' },
  ];
  onChangeTab = new EventEmitter();
  tabPath: string;
  onOpenApp = new EventEmitter();
  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavigationComponent>,
    @Inject(MAT_DIALOG_DATA) public appsManagementDialogData: AppsManagementDialogDataModel,
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
  ) { }

  ngOnInit() {
    this.appsManagementDialogParamsService.context = this.appsManagementDialogData.context;
    this.subscriptions.push(
      this.appsManagementDialogData.tabPath$.subscribe(tabPath => {
        console.log('Apps management tab changed:', tabPath);
        this.tabPath = tabPath;
      }),
      // skip first emit because it will be undefined as BehaviorSubject was just created
      this.appsManagementDialogParamsService.openedAppId$$.pipe(skip(1)).subscribe(openedAppId => {
        this.onOpenApp.emit(openedAppId);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
    this.onChangeTab.complete();
    this.onChangeTab = null;
    this.onOpenApp.complete();
    this.onOpenApp = null;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(url: string) {
    this.onChangeTab.emit(url);
  }

}
