import { Component } from '@angular/core';
import { AppDialogConfigService } from '../../app-administration/services';
import { DialogContextSiteApp } from '../../shared/models/dialog-context.models';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent {
  private sitePrimaryApp: DialogContextSiteApp;
  private globalPrimaryApp: DialogContextSiteApp;

  constructor(private dialogService: DialogService, private appDialogConfigService: AppDialogConfigService) { }

  openSiteSettings(): void {
    if (this.sitePrimaryApp == null) {
      this.getDialogSettings(() => { this.openSiteSettings(); });
      return;
    }

    this.dialogService.openAppAdministration(this.sitePrimaryApp.ZoneId, this.sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings(): void {
    if (this.globalPrimaryApp == null) {
      this.getDialogSettings(() => { this.openGlobalSettings(); });
      return;
    }

    this.dialogService.openAppAdministration(this.globalPrimaryApp.ZoneId, this.globalPrimaryApp.AppId, 'app');
  }

  private getDialogSettings(callback: () => void): void {
    this.appDialogConfigService.getDialogSettings(0).subscribe(dialogSettings => {
      this.sitePrimaryApp = dialogSettings.Context.Site.PrimaryApp;
      this.globalPrimaryApp = dialogSettings.Context.System.PrimaryApp;
      callback();
    });
  }
}
