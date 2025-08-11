import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, inject, Inject, input, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, filter, fromEvent, map, of, switchMap, take, tap } from 'rxjs';
import { Of, transient } from '../../../../../../core';
import { AppsListService } from '../../../apps-management/services/apps-list.service';
import { DragAndDropDirective } from '../../directives/drag-and-drop.directive';
import { CrossWindowMessage, InstallPackage, InstallSettings, SpecsForInstaller } from '../../models/installer-models';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Context } from '../../services/context';
import { AppInstallSettingsService } from '../../services/getting-started.service';
import { InstallerService } from '../../services/installer.service';
import { BaseComponent } from '../base.component';
import { FileUploadDialogData, FileUploadMessageTypes, FileUploadResult, ImportModeValues, UploadTypes } from './file-upload-dialog.models';


@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
  imports: [
    NgClass,
    MatDialogModule,
    MatProgressSpinnerModule,
    SafeHtmlPipe,
    DragAndDropDirective,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatInputModule,
    ReactiveFormsModule
  ]
})
export class FileUploadDialogComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  uploadType = input<Of<typeof UploadTypes>>();
  
  @ViewChild('installerWindow') installerWindow: ElementRef;

  uploading = signal(false);
  showAppCatalog = signal(false);
  result = signal<FileUploadResult>(undefined);
  files = signal<File[]>([]);

  FileUploadMessageTypes = FileUploadMessageTypes;
  UploadTypes = UploadTypes;
  importModeValues = ImportModeValues;

  showProgress: boolean = false;
  currentPackage: InstallPackage;
  remoteInstallerUrl = '';
  urlChangeImportMode = ""
  ready = false;
  settings: InstallSettings;

  #installerService = transient(InstallerService);
  #installSettingsService = transient(AppInstallSettingsService);
  #appsListService = transient(AppsListService);
  #fb = inject(FormBuilder);

  importForm: FormGroup = this.#fb.group({
    importMode: [this.importModeValues.importOriginal, Validators.required],
    name: ['']
  });

  

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FileUploadDialogData,
    private dialog: MatDialogRef<FileUploadDialogComponent>,
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
        this.urlChangeImportMode = settings.remoteUrl
        this.remoteInstallerUrl = <string>this.sanitizer.bypassSecurityTrustResourceUrl(settings.remoteUrl);
        this.ready = true;
      })
    );

    this.#setupConditionalValidation();
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
    // Update the remote installer URL based on the import mode
    // Show multiple select or single select based on import mode
    this.importForm.get('importMode')?.valueChanges.subscribe((mode) => {
      const isTemplate = mode === this.importModeValues.importAsTemplate;
      const url = this.urlChangeImportMode + (this.urlChangeImportMode.includes('?') ? '&' : '?') + `selectOnlyMode=${isTemplate}`;
      this.remoteInstallerUrl = <string>this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });


    if (this.dialogData.files != null)
      this.filesDropped(this.dialogData.files);

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
        // If import mode is 'importAsTemplate', create a Install template with Url and new Name
        if (this.importForm.get('importMode')?.value === this.importModeValues.importAsTemplate) {
          return this.#appsListService.createTemplate(packages[0].url, this.importForm.get('name')?.value);
        } else {
          // Otherwise, install the packages normally
          return this.#installerService.installPackages(packages, p => this.currentPackage = p);
        }
      }),
      tap(() => {
        this.showProgress = false;
        this.changeDetectorRef.detectChanges(); //without this spinner is not removed (though window reload will remove it anyway) so maybe unnecessary
        alert('Installation complete 👍');
        window.top.location.reload();
        this.closeDialog(true);
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

  closeDialog(refresh?: boolean): void {
    this.dialog.close(refresh);
  }

  cleanUpload(): void {
    this.result.set(undefined);
    this.files.set([]);
    this.uploading.set(false);
  }


  #setupConditionalValidation(): void {
    const nameControl = this.importForm.get('name');
    this.importForm.get('importMode')?.valueChanges.subscribe(mode => {
      const isTemplate = mode === this.importModeValues.importAsTemplate;
      nameControl?.setValidators(isTemplate ? [Validators.required] : null);
      nameControl?.updateValueAndValidity();
    });
  }


  filesDropped(files: File[]): void {
    this.#setFiles(files);
  }

  filesChanged(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    const files = Array.from(fileList);
    this.#setFiles(files);
  }

  upload(): void {
    this.uploading.set(true);
    const name = this.importForm.get('name')?.value as string;
    this.subscriptions.add(
      this.dialogData.upload$(this.files(), name).pipe(take(1)).subscribe({
        next: (result) => {
          this.uploading.set(false);
          this.result.set(result);
        },
        error: () => {
          this.uploading.set(false);
          this.result.set(undefined);
          this.snackBar.open('Upload failed. Please check console for more information', undefined, { duration: 3000 });
        },
      }),
    );
  }

  toggleShowAppCatalog(): void {
    this.showAppCatalog.set(!this.showAppCatalog());
  }

  #setFiles(files: File[]): void {
    if (!this.dialogData.multiple)
      files = files.slice(0, 1);

    this.files.set(files);
  }
}

