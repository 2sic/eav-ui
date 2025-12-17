
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { transient } from 'projects/core';
import { Observable, filter, fromEvent, take } from 'rxjs';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { BaseComponent } from '../../../shared/components/base';
import { FileUploadResult, ImportModeValues, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { MessagesFrom2sxc } from '../../../shared/components/file-upload-dialog/messages-from-2sxc';
import { DragAndDropDirective } from '../../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { InstallSettings, InstalledApp, SpecsForInstaller } from '../../../shared/models/installer-models';
import { Context } from '../../../shared/services/context';
import { AppInstallSettingsService } from '../../../shared/services/getting-started.service';
import { Extension, ExtensionEdition, ExtensionPreflightItem } from '../../models/extension.model';
import { AppExtensionsService } from '../../services/app-extensions.service';

export interface FileUploadDialogData {
  title?: string;
  description?: string;
  allowedFileTypes?: string;
  file?: File;
  multiple?: boolean;
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
    MatCheckboxModule,
    FormsModule,
    DragAndDropDirective,
    MatIconModule,
    TippyDirective,
    MatSlideToggleModule,
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

  // Unified State signals
  extension = signal<ExtensionPreflightItem | null>(null);
  isLoadingPreflight = signal(false);
  isInstalling = signal(false);
  preflightError = signal<string | null>(null);
  editions = signal<ExtensionEdition[]>([]);
  showExtensionCatalog = signal(false);
  forceInstall = false;
  allreadyInstalled = computed(() => {
    const ext = this.extension();
    if (!ext) return false;
    return ext.editions?.some(e => e.isInstalled) ?? false; // TODO: instead of some it should check for the specified edition
  });

  // Unified selection state
  selectedEditions: string[] = [];
  preflightSource: File | string | null = null; // Can be a local File or a remote URL string

  urlChangeImportMode = "";
  ready = false;
  settings: InstallSettings;
  #alreadyProcessingRemote = false;

  @ViewChild('installerWindow') installerWindow: ElementRef;

  importForm: FormGroup = this.#fb.group({
    importMode: [this.importModeValues.importOriginal, Validators.required],
    name: ['']
  });

  private context = inject(Context);

  messages = new MessagesFrom2sxc(this.context.moduleId);

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
      this.runFilePreflight(dialogData.file);
    }

    this.subscriptions.add(
      this.#installSettingsService.settings$.subscribe(settings => {
        this.settings = settings;
        this.urlChangeImportMode = settings.remoteUrl;
        this.updateRemoteUrl();
        this.ready = true;
      })
    );
  }

  ngOnInit() {
    this.#watchKeyboardShortcuts();
    this.#installSettingsService.loadGettingStarted(false);

    this.importForm.get('importMode')?.valueChanges.subscribe(() => {
      this.updateRemoteUrl();
    });

    this.subscriptions.add(this.messages.messages$
      // Verify it's for this action
      .pipe(
        filter(data => data.action === 'specs'),
      )
      // Send message to iframe, which apps are already installed
      // Disable 2025-12-16 for now, as we don't have a dedicated
      // update-mode; so for now the installer should always show all apps
      .subscribe(() => {
        return; // Disabled for now
        const winFrame = this.installerWindow.nativeElement as HTMLIFrameElement;

        // Subscribe to the HttpResourceRef to get the data
        this.extensionSvc.getAll().subscribe((res) => {
          const extensions = res?.extensions ?? [];

          const allInstalled = extensions.map((ext: Extension) => ({
            name: ext.configuration?.name,
            guid: ext.configuration?.nameId.toString(),
            version: ext.configuration?.version,
          })) satisfies InstalledApp[];

          const specsMsg: SpecsForInstaller = {
            action: 'specs',
            data: {
              installedApps: allInstalled,
              rules: allInstalled.map(app => ({
                target: 'guid',
                appGuid: app.guid,
                mode: 'f',
                url: ''
              }))
            }
          };
          const specsJson = JSON.stringify(specsMsg);
          winFrame.contentWindow.postMessage(specsJson, '*');
          console.log('debug: just sent specs message:' + specsJson, specsMsg, winFrame);
        });
      })
    );

    // Handle postMessage events from the app catalog dialog (iframe)
    this.subscriptions.add(
      fromEvent<MessageEvent>(window, 'message')
        .pipe(
          filter(() => !!this.installerWindow),
        )
        .subscribe((evt) => {
          let data: any;
          try {
            data = typeof evt.data === 'string'
              ? JSON.parse(evt.data)
              : evt.data;
          } catch {
            return;
          }

          if (this.showExtensionCatalog() && data.action === 'install' && data.packages) {
            const firstPkg: any = Object.values(data.packages)[0];
            if (!firstPkg?.url)
              return;
            if (this.#alreadyProcessingRemote)
              return;

            this.#alreadyProcessingRemote = true;
            this.handleRemotePreflight(firstPkg.url);
          }
        })
    );
  }
  
  // Template Helpers to avoid 'instanceof' and strict type errors in HTML
  get isFileSource(): boolean {
    return this.preflightSource instanceof File;
  }

  get currentFile(): File | null {
    return this.isFileSource ? (this.preflightSource as File) : null;
  }

  private updateRemoteUrl() {
    this.remoteInstallerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.buildRemoteUrl(this.urlChangeImportMode, {
        view: 'app-extensions',
        selectOnlyMode: 'true',
        excludeInstalled: 'true' // Filter out installed extensions
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

  // --- UI Triggers ---

  filesDropped(droppedFiles: File[]): void {
    this.runFilePreflight(droppedFiles[0]);
  }

  filesChanged(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.runFilePreflight(file);
  }

  toggleShowExtensionCatalog(): void {
    this.showExtensionCatalog.set(!this.showExtensionCatalog());
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  cancelPreflight(): void {
    this.extension.set(null);
    this.preflightSource = null;
    this.selectedEditions = [];
    this.preflightError.set(null);
    this.forceInstall = false; // Reset force toggle
    this.#alreadyProcessingRemote = false;
  }

  // --- Unified Preflight Logic ---

  private runFilePreflight(file: File): void {
    this.isLoadingPreflight.set(true);
    this.extensionSvc.installPreflightExtension([file])
      .pipe(take(1))
      .subscribe({
        next: (result) => this.handlePreflightResult(result.extensions[0], file),
        error: (error) => this.handlePreflightError(error)
      });
  }

  private handleRemotePreflight(url: string): void {
    // Hide catalog immediately so user sees spinner
    this.showExtensionCatalog.set(false);
    this.isLoadingPreflight.set(true);

    this.extensionSvc.installPreflightExtensionFromUrl(url)
      .pipe(take(1))
      .subscribe({
        next: (result) => this.handlePreflightResult(result.extensions[0], url),
        error: (error) => this.handlePreflightError(error)
      });
  }

  private handlePreflightResult(ext: ExtensionPreflightItem, source: File | string) {
    this.isLoadingPreflight.set(false);
    this.preflightError.set(null);
    this.extension.set(ext);
    this.preflightSource = source;
    this.forceInstall = false; // Reset logic when new item loaded

    // If already installed, maybe auto-enable force? Or leave for user to decide.
    // For now, we rely on user interaction.

    if (ext.editions?.length > 0) {
      this.editions.set(ext.editions);
    } else {
      this.editions.set(this.fallbackEditions.map(e => ({ edition: e })));
    }

    this.selectedEditions = this.editions().map(e => e.edition);
  }

  private handlePreflightError(error: any) {
    this.isLoadingPreflight.set(false);
    this.extension.set(null);
    this.preflightSource = null;
    this.preflightError.set(error?.message || 'Preflight check failed');
    this.#alreadyProcessingRemote = false;
  }

  // --- Unified Install Logic ---

  canInstall(): boolean {
    if (!this.preflightSource) return false;
    if (this.preflightError()) return false;
    if (this.isInstalling()) return false;
    if (this.isLoadingPreflight()) return false;
    if (!this.extension()) return false;
    if (this.allreadyInstalled() && !this.forceInstall) return false;
    return true;
  }

  install(): void {
    if (!this.canInstall()) return;
    this.isInstalling.set(true);

    const overwrite = this.forceInstall;
    let installObservable: Observable<any>;

    const editionsString = this.selectedEditions.length ? this.selectedEditions.join(',') : undefined;

    if (this.preflightSource instanceof File) {
      installObservable = this.extensionSvc.uploadExtensions(this.preflightSource, editionsString, overwrite);
    } else if (typeof this.preflightSource === 'string') {
      installObservable = this.extensionSvc.installRemoteExtension(this.preflightSource, editionsString, overwrite);
    } else {
      return; // Should not happen
    }

    installObservable.pipe(take(1)).subscribe({
      next: () => {
        this.isInstalling.set(false);
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isInstalling.set(false);
        this.preflightError.set(error?.message || 'Installation failed');
        console.error('Installation error:', error);
      }
    });
  }

  onEditionToggle(edition: string, checked: boolean) {
    if (checked) {
      if (!this.selectedEditions.includes(edition)) {
        this.selectedEditions.push(edition);
      }
    } else {
      this.selectedEditions = this.selectedEditions.filter(e => e !== edition);
    }
  }
}