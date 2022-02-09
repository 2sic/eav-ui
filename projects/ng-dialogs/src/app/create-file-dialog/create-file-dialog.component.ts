import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { asyncScheduler, BehaviorSubject, combineLatest, forkJoin, Observable, of, Subscription, timer } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, tap, throttleTime } from 'rxjs/operators';
import { CreateFileDialogData, CreateFileDialogResult, CreateFileFormControls, CreateFileFormValues, CreateFileTemplateVars } from '.';
import { SanitizeHelper } from '../../../../edit/shared/helpers';
import { PredefinedTemplate } from '../code-editor/models/predefined-template.model';
import { Preview } from '../code-editor/models/preview.models';
import { SourceService } from '../code-editor/services/source.service';

@Component({
  selector: 'app-create-file-dialog',
  templateUrl: './create-file-dialog.component.html',
  styleUrls: ['./create-file-dialog.component.scss']
})
export class CreateFileDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  controls: CreateFileFormControls;
  templateVars$: Observable<CreateFileTemplateVars>;

  private all = 'All' as const;
  private templates$: BehaviorSubject<PredefinedTemplate[]>;
  private loadingPreview$: BehaviorSubject<boolean>;
  private subscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: CreateFileDialogData,
    private dialogRef: MatDialogRef<CreateFileDialogComponent>,
    private sourceService: SourceService,
  ) { }

  ngOnInit(): void {
    this.subscription = new Subscription();
    this.templates$ = new BehaviorSubject<PredefinedTemplate[]>([]);
    this.loadingPreview$ = new BehaviorSubject(false);

    this.buildForm();
    this.fetchTemplates();
    this.buildTemplateVars();
  }

  ngOnDestroy(): void {
    this.templates$.complete();
    this.loadingPreview$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog(result?: CreateFileDialogResult): void {
    this.dialogRef.close(result);
  }

  confirm(): void {
    const formValues: CreateFileFormValues = this.form.getRawValue();

    const result: CreateFileDialogResult = {
      name: formValues.finalName,
      templateKey: formValues.templateKey,
    };
    this.closeDialog(result);
  }

  private fetchTemplates(): void {
    this.sourceService.getPredefinedTemplates(this.dialogData.purpose, this.dialogData.type).subscribe(response => {
      if (this.controls.templateKey.value !== response.Default) {
        this.controls.templateKey.patchValue(response.Default);
      }
      this.templates$.next(response.Templates);
    });
  }

  private buildForm(): void {
    this.form = new FormGroup({
      platform: new FormControl(this.all),
      purpose: new FormControl({ value: this.dialogData.purpose ?? this.all, disabled: this.dialogData.purpose != null }),
      templateKey: new FormControl(null, Validators.required),
      name: new FormControl(this.dialogData.name ?? null, Validators.required),
      finalName: new FormControl({ value: null, disabled: true }),
      folder: new FormControl({ value: this.dialogData.folder ?? '', disabled: true }),
    });

    this.controls = this.form.controls as any;

    this.subscription.add(
      combineLatest([
        this.templates$,
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

    this.subscription.add(
      combineLatest([
        this.templates$,
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

  private buildTemplateVars(): void {
    const platforms$ = this.templates$.pipe(
      map(templates => {
        const platformsMap: Record<string, string> = {
          [this.all]: this.all,
        };
        templates.forEach(template => {
          template.Platforms?.forEach(platform => {
            platformsMap[platform] = platform;
          });
        });
        return Object.keys(platformsMap);
      }),
    );
    const purposes$ = this.templates$.pipe(
      map(templates => {
        const purposesMap: Record<string, string> = {
          [this.all]: this.all,
        };
        templates.forEach(template => {
          purposesMap[template.Purpose] = template.Purpose;
        });
        return Object.keys(purposesMap);
      }),
    );
    const templates$ = combineLatest([
      this.templates$,
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
          const platformMatch = platform === this.all || (template.Platforms?.includes(platform) ?? false);
          const purposeMatch = purpose === this.all || template.Purpose === purpose;
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
        this.loadingPreview$.next(true);
      }),
      switchMap(([finalName, templateKey]) => {
        return !finalName || !templateKey
          ? of<Preview | undefined>(undefined)
          : forkJoin([
            this.sourceService.getPreview(finalName, this.dialogData.global, templateKey),
            timer(500),
          ]).pipe(map(([preview]) => preview));
      }),
      tap(() => {
        this.loadingPreview$.next(false);
      }),
    );
    this.templateVars$ = combineLatest([platforms$, purposes$, templates$, preview$, this.loadingPreview$]).pipe(
      map(([platforms, purposes, templates, preview, loadingPreview]) => {
        const templateVars: CreateFileTemplateVars = {
          platforms,
          purposes,
          templates,
          loadingPreview,
          preview: preview?.Preview,
          previewValid: preview?.IsValid ?? false,
          previewError: preview?.Error,
        };
        return templateVars;
      }),
    );
  }
}
