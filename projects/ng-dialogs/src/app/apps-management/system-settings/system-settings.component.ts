import { Component } from '@angular/core';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent {
  constructor(private dialogService: DialogService, private context: Context, private appsListService: AppsListService) { }

  openSiteSettings() {
    this.appsListService.getAll().subscribe(apps => {
      const contentApp = apps.find(app => app.Guid === eavConstants.contentApp);
      this.dialogService.openAppAdministration(this.context.zoneId, contentApp.Id, 'app');
    });
  }

  openGlobalSettings() {
    this.dialogService.openAppAdministration(eavConstants.defaultZone, eavConstants.defaultApp, 'app');
  }
}
