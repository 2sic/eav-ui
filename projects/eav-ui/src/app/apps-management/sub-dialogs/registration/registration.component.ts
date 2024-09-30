import { Component, HostBinding, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileUploadDialogComponent, FileUploadDialogData } from '../../../shared/components/file-upload-dialog';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';
import { SystemInfoSet } from '../../models/system-info.model';
import { FeaturesConfigService } from '../../services/features-config.service';
import { ZoneService } from '../../services/zone.service';

// Images/Icons
import patronsLogo from '!raw-loader!./assets/2sxc-patrons.svg';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { transient } from '../../../core';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TippyDirective,
    SafeHtmlPipe,
  ],
})
export class RegistrationComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  systemInfoSet = signal<SystemInfoSet>(undefined);

  // patrons logo
  logo = patronsLogo;

  #zoneSvc = transient(ZoneService);
  #featuresConfigSvc = transient(FeaturesConfigService);

  constructor(
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit(): void {
    this.#loadSystemInfo();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  openLicenseRegistration(systemInfoSet: SystemInfoSet): void {
    window.open(`https://patrons.2sxc.org/register?fingerprint=${systemInfoSet.System.Fingerprint}`, '_blank');
  }

  retrieveLicense(): void {
    this.#featuresConfigSvc.retrieveLicense().subscribe({
      error: () => {
        this.snackBar.open('Failed to retrieve license. Please check console for more information', undefined, { duration: 3000 });
      },
      next: (info) => {
        const message = `License ${info.Success ? 'Info' : 'Error'}: ${info.Message}`;
        const duration = info.Success ? 3000 : 100000;
        const panelClass = info.Success ? undefined : 'snackbar-error';
        this.snackBar.open(message, undefined, { duration, panelClass });
        this.#loadSystemInfo();
      },
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
        this.#loadSystemInfo();
      }
    });
  }

  #loadSystemInfo(): void {
    this.#zoneSvc.getSystemInfo().subscribe(info => {
      this.systemInfoSet.set(info);
      console.log(info);
    });
  }

}
