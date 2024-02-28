import { ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, catchError, combineLatest, filter, fromEvent, map, of, switchMap, take, tap } from 'rxjs';
import { BaseSubsinkComponent } from '../base-subsink-component/base-subsink.component';
import { FileUploadDialogData, FileUploadMessageTypes, FileUploadResult, UploadTypes } from './file-upload-dialog.models';
import { AppInstallSettingsService } from '../../services/getting-started.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Context } from '../../services/context';
import { CrossWindowMessage, InstallPackage, InstallSettings, SpecsForInstaller } from '../../models/installer-models';
import { InstallerService } from '../../services/installer.service';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
})
export class FileUploadDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  @Input() uploadType: UploadTypes;

  @ViewChild('installerWindow') installerWindow: ElementRef;

  uploading$ = new BehaviorSubject<boolean>(false);
  files$ = new BehaviorSubject<File[]>([]);
  result$ = new BehaviorSubject<FileUploadResult>(undefined);
  FileUploadMessageTypes = FileUploadMessageTypes;
  UploadTypes = UploadTypes;
  showAppCatalog$ = new BehaviorSubject<boolean>(false);

  viewModel$: Observable<FileUploadDialogViewModel>;

  showProgress: boolean = false;
  currentPackage: InstallPackage;
  remoteInstallerUrl = '';
  ready = false;
  settings: InstallSettings;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FileUploadDialogData,
    private dialogRef: MatDialogRef<FileUploadDialogComponent>,
    private snackBar: MatSnackBar,
    private installSettingsService: AppInstallSettingsService,
    private installerService: InstallerService,
    private sanitizer: DomSanitizer,
    private context: Context,
    private changeDetectorRef: ChangeDetectorRef,
  ) { 
    super();

    // copied from 2sxc-ui app/installer
    this.subscription.add(
      this.installSettingsService.settings$.subscribe(settings => {
        this.settings = settings;
        this.remoteInstallerUrl = <string>this.sanitizer.bypassSecurityTrustResourceUrl(settings.remoteUrl);
        this.ready = true;
      })
    );
  }

  private alreadyProcessing = false;
  // copied from 2sxc-ui app/installer
  // Initial Observable to monitor messages
  private messages$ = fromEvent(window, 'message').pipe(
    // Ensure only one installation is processed.
    filter(() => !this.alreadyProcessing),
    filter((evt: MessageEvent) => evt.origin === "https://2sxc.org"),
    // Get data from event.
    map((evt: MessageEvent) => {
      try {
        return JSON.parse(evt.data) as CrossWindowMessage;
      } catch (e) {
        console.error('error procesing message. Message was ' + evt.data, e);
        return void 0;
      }
    }),
    // Check if data is valid and the moduleID matches
    filter(data => data && Number(data.moduleId) === this.context.moduleId),
  );

  ngOnInit(): void {
    this.subscription.add(
      this.files$.subscribe(() => {
        if (this.result$.value !== undefined) {
          this.result$.next(undefined);
        }
      }),
    );

    if (this.dialogData.files != null) {
      this.filesDropped(this.dialogData.files);
    }

    this.viewModel$ = combineLatest([
      this.uploading$, this.files$, this.result$, this.showAppCatalog$,
    ]).pipe(map(([uploading, files, result, showAppCatalog]) => ({ uploading, files, result, showAppCatalog })));

    // copied from 2sxc-ui
    this.installSettingsService.loadGettingStarted(false);//this.isContentApp -> from @Input on 2sxc-ui

    // copied from 2sxc-ui app/installer
    this.subscription.add(this.messages$.pipe(
      // Verify it's for this action
      filter(data => data.action === 'specs'),
      // Send message to iframe
      tap(() => {
        const winFrame = this.installerWindow.nativeElement as HTMLIFrameElement;
        const specsMsg: SpecsForInstaller = {
          action: 'specs',
          data: {
            //currently not used
            installedApps: this.settings.installedApps,//.map(app => ((app as InstalledApp).guid)),
            //currently used to forbid already installed apps
            rules: this.settings.installedApps.map(app => ({ target: 'guid', appGuid: app.guid, mode: 'f', url: '' })),//this.settings.rules,
          },
        };
        const specsJson = JSON.stringify(specsMsg);
        winFrame.contentWindow.postMessage(specsJson, '*');
        console.log('debug: just sent specs message:' + specsJson, specsMsg, winFrame);
      }),
    ).subscribe());

    // copied from 2sxc-ui app/installer
    // Subscription to listen to 'install' messages
    this.subscription.add(this.messages$.pipe(
      filter(data => data.action === 'install'),
      // Get packages from data.
      map(data => Object.values(data.packages)),
      // Show confirm dialog.
      filter(packages => {
        const packagesDisplayNames = packages
          .reduce((t, c) => `${t} - ${c.displayName}\n`, '');

        const msg = `Do you want to install these packages?

${packagesDisplayNames}
This takes about 10 seconds per package. Don't reload the page while it's installing.`;
        return confirm(msg);
      }),
      // Install the packages one at a time
      switchMap(packages => {
        this.alreadyProcessing = true;
        this.showProgress = true;
        this.changeDetectorRef.detectChanges(); //without this spinner is not shown
        return this.installerService.installPackages(packages, p => this.currentPackage = p);
      }),
      tap(() => {
        this.showProgress = false;
        this.changeDetectorRef.detectChanges(); //without this spinner is not removed (though window reload will remove it anyway) so maybe unnecessary
        alert('Installation complete 👍');
        window.top.location.reload();
      }),
      catchError(error => {
        console.error('Error: ', error);
        this.showProgress = false;
        this.alreadyProcessing = false;
        this.changeDetectorRef.detectChanges(); //without this spinner is not removed
        const errorMsg = `An error occurred: Package ${this.currentPackage.displayName}

${error.error?.Message ?? error.error?.message ?? ''}

${error.message}

Please try again later or check how to manually install content-templates: https://azing.org/2sxc/r/0O4OymoA`;
        alert(errorMsg);
        return of(error);
      }),
    ).subscribe());

  }

  ngOnDestroy(): void {
    this.uploading$.complete();
    this.files$.complete();
    this.result$.complete();
    super.ngOnDestroy();
  }

  closeDialog(refresh?: boolean): void {
    this.dialogRef.close(refresh);
  }

  filesDropped(files: File[]): void {
    this.setFiles(files);
    this.upload();
  }

  filesChanged(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    const files = Array.from(fileList);
    this.setFiles(files);
  }

  upload(): void {
    this.uploading$.next(true);
    this.subscription.add(
      this.dialogData.upload$(this.files$.value).pipe(take(1)).subscribe({
        next: (result) => {
          this.uploading$.next(false);
          this.result$.next(result);
        },
        error: () => {
          this.uploading$.next(false);
          this.result$.next(undefined);
          this.snackBar.open('Upload failed. Please check console for more information', undefined, { duration: 3000 });
        },
      }),
    );
  }

  showAppCatalog(): void { 
    this.showAppCatalog$.next(!this.showAppCatalog$.value);
  }

  private setFiles(files: File[]): void {
    if (!this.dialogData.multiple) {
      files = files.slice(0, 1);
    }
    this.files$.next(files);
  }
}

interface FileUploadDialogViewModel {
  uploading: boolean;
  files: File[];
  result: FileUploadResult;
  showAppCatalog: boolean;
}
