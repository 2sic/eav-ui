import { Component, OnInit } from '@angular/core';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent implements OnInit {
  private siteDefaultAppId: number;

  constructor(private dialogService: DialogService, private context: Context, private appsListService: AppsListService) { }

  ngOnInit() {
  }

  openSiteSettings() {
    if (this.siteDefaultAppId != null) {
      this.dialogService.openAppAdministration(this.context.zoneId, this.siteDefaultAppId, 'data', eavConstants.scopes.configuration.value);
    } else {
      this.appsListService.getAll().subscribe(apps => {
        const defaultApp = apps.find(app => app.Guid.toLocaleLowerCase() === 'default');
        this.siteDefaultAppId = defaultApp.Id;
        this.openSiteSettings();
      });
    }
  }

  openGlobalSettings() {
    const defaultZone = 1;
    const defaultApp = 1;
    this.dialogService.openAppAdministration(defaultZone, defaultApp, 'data', eavConstants.scopes.configuration.value);
  }
}
