import { Component, OnInit, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AppAdministrationDialogDataModel } from '../shared/models/app-administration-dialog-data.model';
import { DialogSettingsModel } from '../shared/models/dialog-settings.model';
import { NavigationTab } from '../../shared/models/navigation-tab.model';

@Component({
  selector: 'app-app-administration-navigation',
  templateUrl: './app-administration-navigation.component.html',
  styleUrls: ['./app-administration-navigation.component.scss']
})
export class AppAdministrationNavigationComponent implements OnInit, OnDestroy {
  tabs = {
    home: { url: 'home', name: 'Home', icon: '' },
    data: { url: 'data', name: 'Data', icon: '' },
    queries: { url: 'queries', name: 'Queries', icon: '' },
    views: { url: 'views', name: 'Views', icon: '' },
    webApi: { url: 'web-api', name: 'WebApi', icon: '' },
    app: { url: 'app', name: 'App', icon: '' },
    global: { url: 'global', name: 'Global', icon: '' },
  };
  tabsArray: NavigationTab[] = [];
  onChangeTab = new EventEmitter();
  tabPath: string;
  dialogSettings: DialogSettingsModel;
  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AppAdministrationNavigationComponent>,
    @Inject(MAT_DIALOG_DATA) public appAdministrationDialogData: AppAdministrationDialogDataModel,
  ) {
    Object.keys(this.tabs).forEach(key => {
      this.tabsArray.push(this.tabs[key]);
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.appAdministrationDialogData.tabPath$.subscribe(tabPath => {
        console.log('App administration tab changed:', tabPath);
        this.tabPath = tabPath;
      }),
    );
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/dialogsettings?appId=${this.appAdministrationDialogData.context.appId}`)
      .subscribe((dialogSettings: DialogSettingsModel) => {
        if (dialogSettings.IsContent) {
          this.tabsArray = this.tabsArray.filter(tab => {
            return tab.url !== this.tabs.queries.url
              && tab.url !== this.tabs.webApi.url
              && tab.url !== this.tabs.app.url;
          });
        }
        this.dialogSettings = dialogSettings;
      });
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
