import { AsyncPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, computed, HostBinding, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { asyncScheduler, BehaviorSubject, combineLatest, distinctUntilChanged, forkJoin, map, Observable, of, startWith, switchMap, tap, throttleTime, timer } from 'rxjs';
import { CreateFileDialogData, CreateFileDialogResult, CreateFileFormControls, CreateFileFormValues, CreateFileViewModel } from '.';
import { transient } from '../../../../core';
import { PredefinedTemplate } from '../code-editor/models/predefined-template.model';
import { Preview } from '../code-editor/models/preview.models';
import { SourceService } from '../code-editor/services/source.service';
import { isCtrlEnter } from '../edit/dialog/main/keyboard-shortcuts';
import { SanitizeHelper } from '../edit/shared/helpers';
import { BaseComponent } from '../shared/components/base';
import { FieldHintComponent } from '../shared/components/field-hint/field-hint.component';
import { MatInputAutofocusDirective } from '../shared/directives/mat-input-autofocus.directive';
import { SaveCloseButtonFabComponent } from '../shared/modules/save-close-button-fab/save-close-button-fab.component';

@Component({
  selector: 'app-create-file-dialog',
  templateUrl: './create-file-dialog.component.html',
  styleUrls: ['./create-file-dialog.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatIconModule,
    MatDialogActions,
    MatProgressSpinnerModule,
    MatButtonModule,
    NgClass,
    AsyncPipe,
    FieldHintComponent,
    MatInputAutofocusDirective,
    SaveCloseButtonFabComponent,
  ]
})
export class CreateFileDialogComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  ngForm: UntypedFormGroup;
  controls: CreateFileFormControls;
  viewModel$: Observable<CreateFileViewModel>;

  #all = 'All' as const;
  #templates$: BehaviorSubject<PredefinedTemplate[]>;
  #loadingPreview$: BehaviorSubject<boolean>;
  #sourceService = transient(SourceService);

  protected formValid = signal(false);

  // Signals for preview loading and validity
  protected loadingPreview = signal(false);
  protected previewValid = signal(false);

  protected canSave = computed(() =>
    this.formValid() &&
    !this.loadingPreview() &&
    this.previewValid()
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: CreateFileDialogData,
    private dialog: MatDialogRef<CreateFileDialogComponent>,
  ) {
    super();
  }

  ngOnInit(): void {
    this.#watchKeyboardShortcuts();

    this.#templates$ = new BehaviorSubject<PredefinedTemplate[]>([]);
    this.#loadingPreview$ = new BehaviorSubject(false);

    this.#buildForm();
    this.#fetchTemplates();
    this.#buildViewModel();

    // Subscribe signals to their sources
    this.subscriptions.add(
      this.#loadingPreview$.subscribe(value => this.loadingPreview.set(value))
    );
  }

  ngAfterViewInit() {
    this.ngForm?.statusChanges.subscribe(() => {
      this.formValid.set(this.ngForm?.valid ?? false);
    });
  }

  ngOnDestroy(): void {
    this.#templates$.complete();
    this.#loadingPreview$.complete();
    super.ngOnDestroy();
  }

  #fetchTemplates(): void {
    this.#sourceService.getPredefinedTemplates(this.dialogData.purpose, this.dialogData.type).then(response => {
      if (this.controls.templateKey.value !== response.Default) {
        this.controls.templateKey.patchValue(response.Default);
      }
      this.#templates$.next(response.Templates);
    });
  }

  #buildForm(): void {
    this.ngForm = new UntypedFormGroup({
      platform: new UntypedFormControl(this.#all),
      purpose: new UntypedFormControl({ value: this.dialogData.purpose ?? this.#all, disabled: this.dialogData.purpose != null }),
      templateKey: new UntypedFormControl(null, Validators.required),
      name: new UntypedFormControl(this.dialogData.name ?? null, Validators.required),
      finalName: new UntypedFormControl({ value: null, disabled: true }),
      folder: new UntypedFormControl({ value: this.dialogData.folder ?? '', disabled: true }),
    });

    this.controls = this.ngForm.controls as any;

    this.subscriptions.add(
      combineLatest([
        this.#templates$,
        this.controls.templateKey.valueChanges.pipe(
          startWith<string>(this.controls.templateKey.value),
          distinctUntilChanged(),
        ),
      ]).subscribe(([templates, templateKey]) => {
        const template = templates.find(t => t.Key === templateKey);
        const suggestedName = this.dialogData.name
          ? this.controls.name.value || this.dialogData.name
          : template?.SuggestedFileName ?? null;

        if (this.controls.name.value !== suggestedName) {
          this.controls.name.patchValue(suggestedName);
        }
      })
    );

    this.subscriptions.add(
      combineLatest([
        this.#templates$,
        this.controls.templateKey.valueChanges.pipe(
          startWith<string>(this.controls.templateKey.value),
          distinctUntilChanged(),
        ),
        this.controls.name.valueChanges.pipe(
          startWith<string>(this.controls.name.value),
          distinctUntilChanged(),
        ),
        this.controls.folder.valueChanges.pipe(
          startWith<string>(this.controls.folder.value),
          distinctUntilChanged(),
        ),
      ]).subscribe(([templates, templateKey, name, folder]) => {
        const template = templates.find(t => t.Key === templateKey);

        let finalName: string = null;
        if (name) {
          folder = folder.trim();
          name = SanitizeHelper.sanitizePath(name.trim());
          name = `${template?.Prefix ?? ''}${name}${template?.Suffix ?? ''}${template?.Extension ?? ''}`;
          finalName = `${folder ? `${folder}/` : ''}${name}`.replace(/\/{2,}/g, '/');
        }

        if (this.controls.finalName.value !== finalName) {
          this.controls.finalName.patchValue(finalName);
        }
      })
    );
  }

  #buildViewModel(): void {
    const platforms$ = this.#templates$.pipe(
      map(templates => {
        const platformsMap: Record<string, string> = {
          [this.#all]: this.#all,
        };
        templates.forEach(template => {
          template.Platforms?.forEach(platform => {
            platformsMap[platform] = platform;
          });
        });
        return Object.keys(platformsMap);
      }),
    );
    const purposes$ = this.#templates$.pipe(
      map(templates => {
        const purposesMap: Record<string, string> = {
          [this.#all]: this.#all,
        };
        templates.forEach(template => {
          purposesMap[template.Purpose] = template.Purpose;
        });
        return Object.keys(purposesMap);
      }),
    );
    const templates$ = combineLatest([
      this.#templates$,
      this.controls.platform.valueChanges.pipe(
        startWith<string>(this.controls.platform.value),
        distinctUntilChanged(),
      ),
      this.controls.purpose.valueChanges.pipe(
        startWith<string>(this.controls.purpose.value),
        distinctUntilChanged(),
      ),
    ]).pipe(
      map(([templates, platform, purpose]) => {
        const filtered = templates.filter(template => {
          const platformMatch = platform === this.#all || (template.Platforms?.includes(platform) ?? false);
          const purposeMatch = purpose === this.#all || template.Purpose === purpose;
          return platformMatch && purposeMatch;
        });
        return filtered;
      }),
      tap(templates => {
        if (!templates.some(t => t.Key === this.controls.templateKey.value)) {
          const newTemplateKey = templates[0]?.Key ?? null;
          if (this.controls.templateKey.value !== newTemplateKey) {
            this.controls.templateKey.patchValue(newTemplateKey);
          }
        }
      }),
    );
    const preview$ = combineLatest([
      this.controls.finalName.valueChanges.pipe(
        startWith<string>(this.controls.finalName.value),
        distinctUntilChanged(),
      ),
      this.controls.templateKey.valueChanges.pipe(
        startWith<string>(this.controls.templateKey.value),
        distinctUntilChanged(),
      ),
    ]).pipe(
      throttleTime(100, asyncScheduler, { leading: true, trailing: true }),
      tap(() => {
        this.#loadingPreview$.next(true);
      }),
      switchMap(([finalName, templateKey]) => {
        return !finalName || !templateKey
          ? of<Preview | undefined>(undefined)
          : forkJoin([
            this.#sourceService.getPreview(finalName, this.dialogData.global, templateKey),
            timer(500),
          ]).pipe(map(([preview]) => preview));
      }),
      tap(() => {
        this.#loadingPreview$.next(false);
      }),
    );

    // Subscribe preview validity signal
    this.subscriptions.add(
      preview$.subscribe(preview => {
        this.previewValid.set(preview?.IsValid ?? false);
      })
    );

    this.viewModel$ = combineLatest([platforms$, purposes$, templates$, preview$, this.#loadingPreview$]).pipe(
      map(([platforms, purposes, templates, preview, loadingPreview]) => {
        const viewModel: CreateFileViewModel = {
          platforms,
          purposes,
          templates,
          loadingPreview,
          preview: preview?.Preview,
          previewValid: preview?.IsValid ?? false,
          previewError: preview?.Error,
        };
        return viewModel;
      }),
    );
  }

  closeDialog(result?: CreateFileDialogResult): void {
    this.dialog.close(result);
  }

  saveAndClose(): void {
    const formValues: CreateFileFormValues = this.ngForm.getRawValue();

    const result: CreateFileDialogResult = {
      name: formValues.finalName,
      templateKey: formValues.templateKey,
    };
    this.closeDialog(result);
  }

  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event) && this.canSave()) {
        event.preventDefault();
        this.saveAndClose();
      }
    });
  }
}