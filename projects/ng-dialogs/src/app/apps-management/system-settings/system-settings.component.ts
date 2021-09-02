import { Component } from '@angular/core';
import { AppDialogConfigService } from '../../app-administration/services';
import { DialogContextDefaultApp } from '../../shared/models/dialog-context.models';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent {
  private siteDefaultApp: DialogContextDefaultApp;
  private globalDefaultApp: DialogContextDefaultApp;

  constructor(private dialogService: DialogService, private appDialogConfigService: AppDialogConfigService) { }

  openSiteSettings(): void {
    if (this.siteDefaultApp == null) {
      this.getDialogSettings(() => { this.openSiteSettings(); });
      return;
    }

    this.dialogService.openAppAdministration(this.siteDefaultApp.ZoneId, this.siteDefaultApp.AppId, 'app');
  }

  openGlobalSettings(): void {
    if (this.globalDefaultApp == null) {
      this.getDialogSettings(() => { this.openGlobalSettings(); });
      return;
    }

    this.dialogService.openAppAdministration(this.globalDefaultApp.ZoneId, this.globalDefaultApp.AppId, 'app');
  }

  private getDialogSettings(callback: () => void): void {
    this.appDialogConfigService.getDialogSettings(0).subscribe(dialogSettings => {
      this.siteDefaultApp = dialogSettings.Context.Site.DefaultApp;
      this.globalDefaultApp = dialogSettings.Context.System.DefaultApp;
      callback();
    });
  }
}
