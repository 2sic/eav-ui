import { Component, OnInit, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AppAdministrationDialogData } from '../shared/models/app-administration-dialog-data.model';
import { DialogSettings } from '../shared/models/dialog-settings.model';
import { NavigationTab } from '../../shared/models/navigation-tab.model';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss']
})
export class AppAdministrationNavComponent implements OnInit, OnDestroy {
  tabs = {
    home: { url: 'home', name: 'Home', icon: 'home', tooltip: 'Getting Started' },
    data: { url: 'data', name: 'Data', icon: 'list', tooltip: 'Content' },
    queries: { url: 'queries', name: 'Queries', icon: 'filter_list', tooltip: 'Query Designer' },
    views: { url: 'views', name: 'Views', icon: 'image', tooltip: 'Views / Templates' },
    webApi: { url: 'web-api', name: 'WebApi', icon: 'flash_on', tooltip: 'WebApi / Data' },
    app: { url: 'app', name: 'App', icon: 'web_asset', tooltip: 'App Settings' },
    global: { url: 'global', name: 'Global', icon: 'public', tooltip: 'Portal / Languages' },
  };
  tabsArray: NavigationTab[] = [];
  onChangeTab = new EventEmitter();
  tabPath: string;
  dialogSettings: DialogSettings;
  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    @Inject(MAT_DIALOG_DATA) public appAdministrationDialogData: AppAdministrationDialogData,
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
      .subscribe((dialogSettings: DialogSettings) => {
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
