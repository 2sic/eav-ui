import { Component, HostBinding, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { catchError, Observable, of, share, startWith, Subject, Subscription, switchMap} from 'rxjs';
import { GlobalConfigService } from '../../../edit/shared/store/ngrx-data/global-config.service';
import { FileUploadDialogComponent, FileUploadDialogData } from '../../../shared/components/file-upload-dialog';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';
import { SystemInfoSet } from '../../models/system-info.model';
import { FeaturesConfigService } from '../../services/features-config.service';
import { ZoneService } from '../../services/zone.service';

// Images/Icons
import patronsLogo from '!raw-loader!./assets/2sxc-patrons.svg';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  debugEnabled$ = this.globalConfigService.getDebugEnabled$();
  systemInfoSet$: Observable<SystemInfoSet>;

  private refreshsystemInfoSet$ = new Subject<void>();

  // patrons logo
  logo = patronsLogo;

  constructor(
    private dialogRef: MatDialogRef<RegistrationComponent>,
    private globalConfigService: GlobalConfigService,
    private zoneService: ZoneService,
    private featuresConfigService: FeaturesConfigService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit(): void {
    this.systemInfoSet$ = this.refreshsystemInfoSet$.pipe(
      startWith(undefined),
      switchMap(() => this.zoneService.getSystemInfo().pipe(catchError(() => of(undefined)))),
      share(),
    );

  }

  closeDialog() {
    this.dialogRef.close();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  openLicenseRegistration(systemInfoSet: SystemInfoSet): void {
    window.open(`https://patrons.2sxc.org/register?fingerprint=${systemInfoSet.System.Fingerprint}`, '_blank');
  }

  retrieveLicense(): void {
    this.featuresConfigService.retrieveLicense().subscribe({
      error: () => {
        this.snackBar.open('Failed to retrieve license. Please check console for more information', undefined, { duration: 3000 });
      },
      next: (info) => {
        const message = `License ${info.Success ? 'Info' : 'Error'}: ${info.Message}`;
        const duration = info.Success ? 3000 : 100000;
        const panelClass = info.Success ? undefined : 'snackbar-error';
        this.snackBar.open(message, undefined, { duration, panelClass });
        this.refreshsystemInfoSet$.next();
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
      upload$: (files) => this.featuresConfigService.uploadLicense(files[0]),
    };
    const dialogRef = this.dialog.open(FileUploadDialogComponent, {
      data,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    dialogRef.afterClosed().subscribe((refresh?: boolean) => {
      if (refresh) {
        this.refreshsystemInfoSet$.next();
      }
    });
  }
}
