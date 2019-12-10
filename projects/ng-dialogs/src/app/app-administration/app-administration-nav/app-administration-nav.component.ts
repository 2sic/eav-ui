import { Component, OnInit, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';

import { AppAdministrationDialogData } from '../shared/models/app-administration-dialog-data.model';
import { DialogSettings } from '../shared/models/dialog-settings.model';

@Component({
  selector: 'app-app-administration-nav',
  templateUrl: './app-administration-nav.component.html',
  styleUrls: ['./app-administration-nav.component.scss']
})
export class AppAdministrationNavComponent implements OnInit, OnDestroy {
  tabs = ['home', 'data', 'queries', 'views', 'web-api', 'app', 'global']; // tabs has to match template and filter below
  onChangeTab = new EventEmitter();
  tabIndex: number;
  dialogSettings: DialogSettings;
  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AppAdministrationNavComponent>,
    @Inject(MAT_DIALOG_DATA) public appAdministrationDialogData: AppAdministrationDialogData,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/dialogsettings?appId=${this.appAdministrationDialogData.context.appId}`)
      .subscribe((dialogSettings: DialogSettings) => {
        if (dialogSettings.IsContent) {
          this.tabs = this.tabs.filter(tab => {
            return !(tab === 'queries' || tab === 'web-api' || tab === 'app');
          });
        }
        this.dialogSettings = dialogSettings; // needed to filter tabs

        this.subscriptions.push(
          this.appAdministrationDialogData.tabPath$.subscribe(tabPath => {
            console.log('App administration tab changed:', tabPath);
            this.tabIndex = this.tabs.indexOf(tabPath);
          }),
        );
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

  changeTab(event: MatTabChangeEvent) {
    this.onChangeTab.emit(this.tabs[event.index]);
  }
}
