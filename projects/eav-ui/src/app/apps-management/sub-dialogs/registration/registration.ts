import patronsLogo from '!raw-loader!./assets/2sxc-patrons.svg';
import { Component, computed, HostBinding, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../../core';
import { FileUploadDialogComponent, FileUploadDialogData } from '../../../shared/components/file-upload-dialog';
import { DialogHeaderComponent } from "../../../shared/dialog-header/dialog-header";
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { SystemInfoSet } from '../../models/system-info.model';
import { FeaturesConfigService } from '../../services/features-config.service';
import { ZoneService } from '../../services/zone.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.html',
  styleUrls: ['./registration.scss'],
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TippyDirective,
    SafeHtmlPipe,
    DialogHeaderComponent
]
})
export class RegistrationComponent {
  @HostBinding('className') hostClass = 'dialog-component';

  // patrons logo
  logo = patronsLogo;

  #zoneSvc = transient(ZoneService);
  #featuresConfigSvc = transient(FeaturesConfigService);
  protected clipboard = transient(ClipboardService);

  constructor(
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  #refresh = signal(0);
  #systemInfoStreams = this.#zoneSvc.getSystemInfoLive(this.#refresh).value;

  systemInfoSet = computed<SystemInfoSet | undefined>(() => {
    const streams = this.#systemInfoStreams();
    if (streams == null) 
      return undefined;

    const system = streams.System?.[0];
    const site = streams.Site?.[0];
    const license = streams.License?.[0];
    const messages = streams.Messages?.[0];

    if (system == null || site == null || license == null) 
      return undefined;

    return {
      System: system,
      Site: site,
      License: license,
      Messages: messages ?? {
        WarningsObsolete: 0,
        WarningsOther: 0,
      },
    };
  });

  openLicenseRegistration(systemInfoSet: SystemInfoSet | undefined): void {
    if (systemInfoSet == null)
      return;
    window.open(`https://patrons.2sxc.org/register?fingerprint=${systemInfoSet.System.Fingerprint}`, '_blank');
  }


  retrieveLicense(): void {
  this.#featuresConfigSvc.retrieveLicensePromise()
    .then(info => {
      const message = `License ${info.Success ? 'Info' : 'Error'}: ${info.Message}`;
      const duration = info.Success ? 3000 : 100000;
      const panelClass = info.Success ? undefined : 'snackbar-error';
      this.snackBar.open(message, undefined, { duration, panelClass });
      this.#refreshSystemInfo();
    })
    .catch(() => {
      this.snackBar.open('Failed to retrieve license. Please check console for more information', undefined, { duration: 3000 });
    });
}

  registerManually(): void {
    window.open(`https://patrons.2sxc.org/`, '_blank');
  }

  openLicenseUpload(): void {
    const data: FileUploadDialogData = {
      title: 'Upload license',
      description: '',
      allowedFileTypes: 'json',
      upload$: (files) => this.#featuresConfigSvc.uploadLicense(files[0]),
    };
    const dialogRef = this.matDialog.open(FileUploadDialogComponent, {
      data,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    dialogRef.afterClosed().subscribe((refresh?: boolean) => {
      if (refresh) {
        this.#refreshSystemInfo();
      }
    });
  }

  #refreshSystemInfo(): void {
    this.#refresh.update(v => ++v)
  }

}
