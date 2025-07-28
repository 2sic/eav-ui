import { Component, effect, ElementRef, HostBinding, inject, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { filter, fromEvent, map, Observable } from 'rxjs';
import { transient } from '../../../../../core';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { CrossWindowMessage, InstallSettings } from '../../shared/models/installer-models';
import { AppInstallSettingsService } from '../../shared/services/getting-started.service';
import { appNameError, appNamePattern } from '../constants/app.patterns';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogActions,
    MatButtonModule,
    FieldHintComponent,
    MatRadioModule,
    MatIconModule,

  ]
})
export class CreateAppComponent {
  // Add a CSS class to the host element for consistent dialog styling
  @HostBinding('className') hostClass = 'dialog-component';
  // Reference to the installer iframe element (for cross-window messaging)
  @ViewChild('installerWindow') installerWindow: ElementRef;

  // Reactive form group for app creation fields
  form: UntypedFormGroup;

  // Signal to control loading spinner and disable UI during app creation
  loading = signal<boolean>(false);
  // Error message for invalid app names, used in template validation
  appNameError = appNameError;
  // URL for the remote app catalog iframe, sanitized for Angular
  remoteInstallerUrl = '';
  // Signal to indicate when the iframe is ready to be shown
  ready = signal(false);
  // Signal to toggle visibility of the app catalog iframe
  showAppCatalog = signal(true);
  // Prevents double-processing of installations via window messages
  private alreadyProcessing = false;

  // App and settings service instances (using custom transient DI)
  private appsListService = transient(AppsListService);
  private installSettingsService = transient(AppInstallSettingsService);

  private router = inject(Router);

  // Holds the URL of the package selected in the app catalog (reactive signal)
  private packageUrl = signal<string>(null);

  // Holds installer settings loaded from service
  settings: InstallSettings;

  // Signal controlling Create button state (enabled/disabled)
  canCreate = signal<boolean>(false);

  // Reactive observable for cross-window installer messages
  private messages$ = fromEvent(window, 'message').pipe(
    // Ignore messages if already processing an installation
    filter(() => !this.alreadyProcessing),
    // Only accept messages from the trusted installer domain
    filter((evt: MessageEvent) => evt.origin === "https://2sxc.org"),
    // Parse the incoming message and update packageUrl signal
    map((evt: MessageEvent) => {
      const x = JSON.parse(evt.data) as CrossWindowMessage;
      this.packageUrl.set(x.packages?.[0]?.url || null);
    }),
  );

  constructor(
    private dialog: MatDialogRef<CreateAppComponent>,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
  ) {
    // Initialize the reactive form with validation
    this.form = this.buildForm();

    // Set Create button state initially
    this.updateCanCreate();

    // Re-calculate Create button state on any form value change
    this.form.valueChanges.subscribe(() => this.updateCanCreate());

    // Load installer settings and set up the iframe URL for the app catalog
    this.installSettingsService.loadGettingStarted(false);
    this.installSettingsService.settings$.subscribe(settings => {
      let url = settings.remoteUrl;
      // Add query param to ensure template mode in the installer
      url += (url.includes('?') ? '&' : '?') + 'isTemplate=true';

      this.remoteInstallerUrl = <string>this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.ready.set(true);
    });

    // React to changes in packageUrl and update Create button accordingly
    effect(() => {
      this.packageUrl();
      this.updateCanCreate();
    });
  }

  ngOnInit(): void {
    // Ensure installer settings are loaded (redundant if already done in constructor)
    this.installSettingsService.loadGettingStarted(false);

    // Listen for messages from the app catalog iframe (e.g., package selection)
    this.messages$.subscribe();
  }

  /**
   * Handles the app creation logic. Disables the form and shows feedback messages.
   * Decides whether to create a raw app or use a selected template.
   */
  create(): void {
    if (!this.canCreate()) return;
    this.form.disable();
    this.loading.set(true);
    this.snackBar.open('Creating app...', undefined, { duration: 2000 });

    let createObservable: Observable<any>;
    const appTemplateId = Number(this.form.controls.appTemplateId.value);
    const name = this.form.controls.name.value?.trim().replace(/\s\s+/g, ' ');

    // Use the selected template if applicable, otherwise create a raw app
    if (appTemplateId === 1 && this.packageUrl() && this.packageUrl().length > 0) {
      createObservable = this.appsListService.createTemplate(this.packageUrl(), name);
    } else if (appTemplateId === 0) {
      createObservable = this.appsListService.create(name, null, 0);
    }

    // Subscribe to creation result and show success/error feedback
    createObservable.subscribe({
      error: () => this.handleCreateError(),
      next: () => this.handleCreateSuccess()
    });
  }

  /**
   * Handles errors that occur during app creation.
   * Re-enables the form and displays a failure message.
   */
  private handleCreateError(): void {
    this.form.enable();
    this.loading.set(false);
    this.snackBar.open('Failed to create app. Please check console for more information', undefined, { duration: 3000 });
  }

  /**
   * Handles successful app creation by enabling the form,
   * showing a success message, and closing the dialog.
   */
  private handleCreateSuccess(): void {
    this.form.enable();
    this.loading.set(false);
    this.snackBar.open('Created app', undefined, { duration: 2000 });
    this.closeDialog();
  }

  /**
   * Closes the create app dialog.
   */
  closeDialog(): void {
    this.dialog.close();
  }

  /**
   * Builds and returns the reactive form group with validation.
   */
  private buildForm(): UntypedFormGroup {
    return new UntypedFormGroup({
      name: new UntypedFormControl(null, [Validators.required, Validators.pattern(appNamePattern)]),
      appTemplateId: new UntypedFormControl(1, Validators.required),
    });
  }

  /**
   * Updates the canCreate signal based on form and packageUrl state.
   * Enables the Create button only if conditions are met.
   */
  private updateCanCreate(): void {
    const name = this.form.controls.name.value?.trim();
    const appTemplateId = Number(this.form.controls.appTemplateId.value);
    const packageUrl = this.packageUrl();

    // Enable Create if: 
    // - name is present and appTemplateId is 0, OR
    // - name, appTemplateId=1, and packageUrl are all present
    const valid =
      !!name &&
      (
        appTemplateId === 0 ||
        (appTemplateId === 1 && !!packageUrl)
      );
    this.canCreate.set(valid);
  }

  /**
   * Handles changes to the template selection radio group.
   * Shows or hides the app catalog iframe and updates Create button state.
   */
  onTemplateChange(event: any) {
    if (event.value == 1)
      this.showAppCatalog.set(true);
    else
      this.showAppCatalog.set(false);

    this.updateCanCreate();
  }

  switchToImportApp(): void {
    this.dialog.close();
    const segments = this.router.url.split('/').filter(Boolean);
    segments[segments.length - 1] = 'import';
    this.router.navigate(segments);

  }

  get appTemplateIdValue() { return this.form.controls.appTemplateId.value; }
}