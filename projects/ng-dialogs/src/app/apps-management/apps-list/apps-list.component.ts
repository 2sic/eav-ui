import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { App } from '../../shared/models/app.model';
import { AppsManagementDialogParamsService } from '../shared/apps-management-dialog-params.service';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss']
})
export class AppsListComponent implements OnInit {
  apps: App[] = [];

  constructor(
    private http: HttpClient,
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
  ) { }

  ngOnInit() {
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=${this.appsManagementDialogParamsService.context.zoneId}`)
      .subscribe((apps: App[]) => {
        this.apps = apps;
      });
  }

  openApp(appId: number) {
    this.appsManagementDialogParamsService.openedAppId$$.next(appId);
  }

}
