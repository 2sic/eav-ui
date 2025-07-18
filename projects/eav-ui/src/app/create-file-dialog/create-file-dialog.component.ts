import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// tslint:disable-next-line:max-line-length
import { AsyncPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { asyncScheduler, BehaviorSubject, combineLatest, distinctUntilChanged, forkJoin, map, Observable, of, startWith, switchMap, tap, throttleTime, timer } from 'rxjs';
import { CreateFileDialogData, CreateFileDialogResult, CreateFileFormControls, CreateFileFormValues, CreateFileViewModel } from '.';
import { transient } from '../../../../core';
import { PredefinedTemplate } from '../code-editor/models/predefined-template.model';
import { Preview } from '../code-editor/models/preview.models';
import { SourceService } from '../code-editor/services/source.service';
import { SanitizeHelper } from '../edit/shared/helpers';
import { BaseComponent } from '../shared/components/base.component';
import { FieldHintComponent } from '../shared/components/field-hint/field-hint.component';
import { MatInputAutofocusDirective } from '../shared/directives/mat-input-autofocus.directive';

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
    MatProgressSpinnerModule,
    MatButtonModule,
    NgClass,
    AsyncPipe,
    FieldHintComponent,
    MatInputAutofocusDirective,
  ]
})
export class CreateFileDialogComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  controls: CreateFileFormControls;
  viewModel$: Observable<CreateFileViewModel>;

  #all = 'All' as const;
  #templates$: BehaviorSubject<PredefinedTemplate[]>;
  #loadingPreview$: BehaviorSubject<boolean>;
  #sourceService = transient(SourceService);

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: CreateFileDialogData,
    private dialog: MatDialogRef<CreateFileDialogComponent>,
  ) {
    super();
  }

  ngOnInit(): void {
    this.#templates$ = new BehaviorSubject<PredefinedTemplate[]>([]);
    this.#loadingPreview$ = new BehaviorSubject(false);

    this.#buildForm();
    this.#fetchTemplates();
    this.#buildViewModel();
  }

  ngOnDestroy(): void {
    this.#templates$.complete();
    this.#loadingPreview$.complete();
    super.ngOnDestroy();
  }

  closeDialog(result?: CreateFileDialogResult): void {
    this.dialog.close(result);
  }

  confirm(): void {
    const formValues: CreateFileFormValues = this.form.getRawValue();

    const result: CreateFileDialogResult = {
      name: formValues.finalName,
      templateKey: formValues.templateKey,
    };
    this.closeDialog(result);
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
    this.form = new UntypedFormGroup({
      platform: new UntypedFormControl(this.#all),
      purpose: new UntypedFormControl({ value: this.dialogData.purpose ?? this.#all, disabled: this.dialogData.purpose != null }),
      templateKey: new UntypedFormControl(null, Validators.required),
      name: new UntypedFormControl(this.dialogData.name ?? null, Validators.required),
      finalName: new UntypedFormControl({ value: null, disabled: true }),
      folder: new UntypedFormControl({ value: this.dialogData.folder ?? '', disabled: true }),
    });

    this.controls = this.form.controls as any;

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
}
