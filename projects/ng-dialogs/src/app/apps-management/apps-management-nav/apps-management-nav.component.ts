import { Component, OnInit, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { AppsManagementDialogData } from '../shared/apps-management-dialog-data.model';
import { AppsManagementDialogParamsService } from '../shared/apps-management-dialog-params.service';
import { NavigationTab } from '../../shared/models/navigation-tab.model';

@Component({
  selector: 'app-apps-management-nav',
  templateUrl: './apps-management-nav.component.html',
  styleUrls: ['./apps-management-nav.component.scss']
})
export class AppsManagementNavComponent implements OnInit, OnDestroy {
  tabs = {
    apps: { url: 'list', name: 'Apps', icon: '' },
    settings: { url: 'settings', name: 'Settings', icon: '' },
    features: { url: 'features', name: 'Features', icon: '' },
    sxcInsights: { url: 'sxc-insights', name: '2sxc Insights', icon: '' },
  };
  tabsArray: NavigationTab[] = [];
  onChangeTab = new EventEmitter();
  tabPath: string;
  onOpenApp = new EventEmitter();
  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<AppsManagementNavComponent>,
    @Inject(MAT_DIALOG_DATA) public appsManagementDialogData: AppsManagementDialogData,
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
  ) {
    Object.keys(this.tabs).forEach(key => {
      this.tabsArray.push(this.tabs[key]);
    });
  }

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
