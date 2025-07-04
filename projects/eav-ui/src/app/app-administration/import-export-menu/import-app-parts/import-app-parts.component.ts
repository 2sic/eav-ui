import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, catchError, filter, fromEvent, map, of, switchMap, take, tap } from 'rxjs';
import { transient } from '../../../../../../core';
import { BaseComponent } from '../../../shared/components/base.component';
import { FileUploadDialogData, FileUploadMessageTypes, FileUploadResult, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { DragAndDropDirective } from '../../../shared/directives/drag-and-drop.directive';
import { CrossWindowMessage, InstallPackage, InstallSettings, SpecsForInstaller } from '../../../shared/models/installer-models';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { Context } from '../../../shared/services/context';
import { AppInstallSettingsService } from '../../../shared/services/getting-started.service';
import { InstallerService } from '../../../shared/services/installer.service';
import { ImportAppPartsService } from '../../services/import-app-parts.service';

@Component({
  selector: 'app-import-app-parts',
  templateUrl: './import-app-parts.component.html',
  styleUrls: ['./import-app-parts.component.scss'],
  imports: [
    NgClass,
    MatDialogModule,
    MatProgressSpinnerModule,
    SafeHtmlPipe,
    DragAndDropDirective,
    MatButtonModule,
    MatIconModule,
  ]
})
export class ImportAppPartsComponent extends BaseComponent implements OnInit, OnDestroy {
  // Code are copied from file-upload-dialog

  private importAppPartsService = transient(ImportAppPartsService);
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('installerWindow') installerWindow: ElementRef;

  uploadType = UploadTypes.AppPart;

  uploading = signal(false);
  result = signal<FileUploadResult>(undefined);
  files = signal<File[]>([]);

  FileUploadMessageTypes = FileUploadMessageTypes;

  UploadTypes = UploadTypes;
  showAppCatalog$ = new BehaviorSubject<boolean>(false);

  showProgress: boolean = false;
  currentPackage: InstallPackage;
  remoteInstallerUrl = '';
  ready = false;
  settings: InstallSettings;

  importData: FileUploadDialogData = {
    title: 'Import Content and Templates into this App',
    description: `
    Import content and templates from a content export (zip) or partial export (xml) to this app.
    The entire content of the selected file will be imported.
    If you want to import an entire app, go to the <em>Apps Management</em>.
    For further help visit <a href="https://2sxc.org/en/help?tag=import" target="_blank">2sxc Help</a>.
    `,
    allowedFileTypes: 'xml',
    upload$: (files: File[]) => this.importAppPartsService.importAppParts(files[0]),
  };

  #installerService = transient(InstallerService);
  #installSettingsService = transient(AppInstallSettingsService);

  constructor(
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private context: Context,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();

    // copied from 2sxc-ui app/installer
    this.subscriptions.add(
      this.#installSettingsService.settings$.subscribe(settings => {
        this.settings = settings;
        this.remoteInstallerUrl = <string>this.sanitizer.bypassSecurityTrustResourceUrl(settings.remoteUrl);
        this.ready = true;
      })
    );
  }

  #alreadyProcessing = false;
  // copied from 2sxc-ui app/installer
  // Initial Observable to monitor messages
  #messages$ = fromEvent(window, 'message').pipe(
    // Ensure only one installation is processed.
    filter(() => !this.#alreadyProcessing),
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

    if (this.importData.files != null) {
      this.filesDropped(this.importData.files);
    }
    // copied from 2sxc-ui
    this.#installSettingsService.loadGettingStarted(false); // Passed as input from 2sxc-ui

    // copied from 2sxc-ui app/installer
    this.subscriptions.add(this.#messages$.pipe(
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
    this.subscriptions.add(this.#messages$.pipe(
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
        this.#alreadyProcessing = true;
        this.showProgress = true;
        this.changeDetectorRef.detectChanges(); //without this spinner is not shown
        return this.#installerService.installPackages(packages, p => this.currentPackage = p);
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
        this.#alreadyProcessing = false;
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
    super.ngOnDestroy();
  }


  filesDropped(files: File[]): void {
    this.#setFiles(files);
    this.upload();
  }

  filesChanged(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    const files = Array.from(fileList);
    this.#setFiles(files);
  }

  refresh(): void {
    this.files.set([]);
    this.result.set(undefined);
    this.uploading.set(false);
    this.importData.files = undefined;
  }

  upload(): void {
    this.uploading.set(true);
    this.subscriptions.add(
      this.importData.upload$(this.files()).pipe(take(1)).subscribe({


        next: (result) => {
          console.log('uploading files', result),
            this.uploading.set(false);
          this.result.set(result);
        },
        error: () => {
          console.log('uploading error', this.files()),

            this.uploading.set(false);
          this.result.set(undefined);
          this.snackBar.open('Upload failed. Please check console for more information', undefined, { duration: 3000 });
        },
      }),
    );
  }

  #setFiles(files: File[]): void {
    if (!this.importData.multiple) {
      files = files.slice(0, 1);
    }
    this.files.set(files);
  }
}



