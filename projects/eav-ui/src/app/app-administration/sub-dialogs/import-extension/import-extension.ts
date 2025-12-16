import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { transient } from 'projects/core';
import { Observable, fromEvent, take } from 'rxjs';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { BaseComponent } from '../../../shared/components/base';
import { FileUploadResult, ImportModeValues, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { DragAndDropDirective } from '../../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { InstallSettings } from '../../../shared/models/installer-models';
import { AppInstallSettingsService } from '../../../shared/services/getting-started.service';
import { ExtensionEdition, ExtensionPreflightItem } from '../../models/extension.model';
import { AppExtensionsService } from '../../services/app-extensions.service';

export interface FileUploadDialogData {
  title?: string;
  description?: string;
  allowedFileTypes?: string;
  file?: File;
  multiple?: boolean;
  // upload$?(files: File[]): Observable<FileUploadResult>;
  upload$?(files: File[], name?: string): Observable<FileUploadResult>;
}

@Component({
  selector: 'app-import-extension',
  templateUrl: './import-extension.html',
  styleUrls: ['./import-extension.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    DragAndDropDirective,
    MatIconModule,
    TippyDirective,
  ],
})
export class ImportExtensionComponent extends BaseComponent implements OnInit {
  private extensionSvc = transient(AppExtensionsService);
  #installSettingsService = transient(AppInstallSettingsService);
  #fb = transient(FormBuilder);

  uploadType = UploadTypes.Extension;
  remoteInstallerUrl: SafeResourceUrl;

  importModeValues = ImportModeValues;

  // TODO: @2pp - Replace debugging vars when backend is ready
  private readonly fallbackEditions = ['staging', 'live'];

  // State signals
  file = signal<File | null>(null);
  extension = signal<ExtensionPreflightItem | null>(null);
  isLoadingPreflight = signal(false);
  isInstalling = signal(false);
  preflightError = signal<string | null>(null);
  editions = signal<ExtensionEdition[]>([]);
  showExtensionCatalog = signal(false);

  // Selected editions for installation
  selectedEditions: string = '';
  urlChangeImportMode = "";
  ready = false;
  settings: InstallSettings;

  // Remote install state (catalog)
  installingRemote = signal(false);
  remotePreflightError = signal<string | null>(null);
  remotePreflight = signal<ExtensionPreflightItem | null>(null);
  remoteUrlToInstall: string | null = null;
  remoteSelectedEditions: string = '';
  #alreadyProcessingRemote = false;

  @ViewChild('installerWindow') installerWindow: ElementRef;

  importForm: FormGroup = this.#fb.group({
    importMode: [this.importModeValues.importOriginal, Validators.required],
    name: ['']
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FileUploadDialogData,
    private dialogRef: MatDialogRef<ImportExtensionComponent>,
    private sanitizer: DomSanitizer,
  ) {
    super();

    dialogData.title ??= `Import Extension`;
    dialogData.description ??= `Select Extension folder from your computer to import.`;
    dialogData.allowedFileTypes ??= 'zip';
    dialogData.multiple ??= true;

    // Check if files were passed via dialogData (from drag-drop on main component)
    if (dialogData.file) {
      this.file.set(dialogData.file);
      this.runPreflight(dialogData.file);
    }

    this.subscriptions.add(
      this.#installSettingsService.settings$.subscribe(settings => {
        this.settings = settings;
        this.urlChangeImportMode = settings.remoteUrl;
        this.remoteInstallerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.buildRemoteUrl(this.urlChangeImportMode, {
            view: 'app-extensions',
            selectOnlyMode: 'true'
          })
        );
        this.ready = true;
      })
    );
  }

  ngOnInit() {
    this.#watchKeyboardShortcuts();
    this.#installSettingsService.loadGettingStarted(false);

    this.importForm.get('importMode')?.valueChanges.subscribe(() => {
      this.remoteInstallerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.buildRemoteUrl(this.urlChangeImportMode, {
          view: 'app-extensions',
          selectOnlyMode: 'true'
        })
      );
    });

    // Handle postMessage events from the app catalog dialog (iframe)
    this.subscriptions.add(
      fromEvent<MessageEvent>(window, 'message').subscribe((evt) => {
        // Optionally, check known origin: if (evt.origin !== 'https://2sxc.org') return;
        let data: any;
        try { data = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data; } catch { return; }
        if (this.showExtensionCatalog() && data.action === 'install' && data.packages) {
          const firstPkg: any = Object.values(data.packages)[0];
          if (!firstPkg?.url) return;
          if (this.#alreadyProcessingRemote) return;
          this.#alreadyProcessingRemote = true;
          this.handleRemotePreflight(firstPkg.url);
        }
      })
    );
  }

  private buildRemoteUrl(baseUrl: string, params: Record<string, string> = {}): string {
    const [urlBase, queryString] = baseUrl.split('?');
    const query = new URLSearchParams(queryString || '');
    for (const key in params) {
      query.set(key, params[key]);
    }
    return `${urlBase}?${query.toString()}`;
  }

  #watchKeyboardShortcuts(): void {
    this.dialogRef.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event)) {
        event.preventDefault();
        this.install();
      }
    });
  }

  filesDropped(droppedFiles: File[]): void {
    this.file.set(droppedFiles[0]);
    this.runPreflight(droppedFiles[0]);
  }

  filesChanged(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.file.set(file);
    this.runPreflight(file);
  }

  toggleShowExtensionCatalog(): void {
    this.showExtensionCatalog.set(!this.showExtensionCatalog());
  }

  private runPreflight(file: File): void {
    this.isLoadingPreflight.set(true);
    this.extensionSvc.installPreflightExtension([file])
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.isLoadingPreflight.set(false);
          const ext = result.extensions[0];
          this.extension.set(ext);


          if (ext.editions?.length > 0) {
            this.editions.set(ext.editions);
          } else {
            this.editions.set(
              this.fallbackEditions.map(e => ({ edition: e }))
            );
          }

          this.selectedEditions = this.editions().map(e => e.edition).join(',');
        },
        error: (error) => {
          this.isLoadingPreflight.set(false);
          this.preflightError.set(error?.message || 'Preflight check failed');
        }
      });
  }

  canSave(): boolean {
    if (!this.file()) return false;
    if (this.preflightError()) return false;
    if (this.isInstalling()) return false;
    if (this.isLoadingPreflight()) return false;
    if (!this.extension()) return false;
    return true;
  }

  install(): void {
    if (!this.file()) return;
    this.isInstalling.set(true);

    // Pass selected edition as an array parameter if available
    const editions = this.selectedEditions?.length ? this.selectedEditions : undefined;
    this.extensionSvc.uploadExtensions(this.file(), editions).pipe(take(1)).subscribe({
      next: () => {
        this.isInstalling.set(false);
        this.dialogRef.close(true); // Close and refresh parent
      },
      error: (error) => {
        this.isInstalling.set(false);
        this.preflightError.set(error?.message || 'Installation failed');
        console.error('Installation error:', error);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  private handleRemotePreflight(url: string) {
    this.installingRemote.set(true);
    this.remotePreflightError.set(null);
    this.remotePreflight.set(null);
    this.remoteUrlToInstall = null;
    this.extensionSvc.installPreflightExtensionFromUrl(url).pipe(take(1)).subscribe({
      next: (result) => {
        this.installingRemote.set(false);
        const ext = result.extensions[0];
        this.remotePreflight.set(ext);
        this.remoteUrlToInstall = url;
        this.remoteSelectedEditions = ext.editions?.map(e => e.edition).join(',') ?? '';
        this.showExtensionCatalog.set(false);
      },
      error: (err) => {
        this.installingRemote.set(false);
        this.remotePreflightError.set(err?.message || 'Remote preflight failed');
        this.#alreadyProcessingRemote = false;
      }
    });
  }

  installRemote(): void {
    if (!this.remoteUrlToInstall) return;
    this.installingRemote.set(true);
    this.remotePreflightError.set(null);
    this.extensionSvc.installRemoteExtension(this.remoteUrlToInstall, this.remoteSelectedEditions)
      .pipe(take(1)).subscribe({
        next: () => {
          this.installingRemote.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.installingRemote.set(false);
          this.remotePreflightError.set(err?.message || 'Remote installation failed');
          this.#alreadyProcessingRemote = false;
        }
      });
  }

  canInstallRemote(): boolean {
    return !!this.remotePreflight() && !this.remotePreflightError() && !this.installingRemote();
  }
}