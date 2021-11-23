import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SanitizeHelper } from '../../../../../edit/shared/helpers';
import { PredefinedTemplate } from '../models/predefined-template.model';
import { SourceService } from '../services/source.service';
import { CreateFileDialogData, CreateFileDialogResult, CreateFileFormControls, CreateFileFormValues, CreateFileTemplateVars } from './create-file-dialog.models';

@Component({
  selector: 'app-create-file-dialog',
  templateUrl: './create-file-dialog.component.html',
  styleUrls: ['./create-file-dialog.component.scss']
})
export class CreateFileDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  controls: CreateFileFormControls;
  showPreview = false;
  templateVars$: Observable<CreateFileTemplateVars>;

  private templates$: BehaviorSubject<PredefinedTemplate[]>;
  private all = 'All' as const;
  private subscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: CreateFileDialogData,
    private dialogRef: MatDialogRef<CreateFileDialogComponent>,
    private sourceService: SourceService,
  ) { }

  ngOnInit(): void {
    this.subscription = new Subscription();
    this.templates$ = new BehaviorSubject<PredefinedTemplate[]>([]);

    this.fetchTemplates();
    this.buildForm();
    this.buildTemplateVars();
  }

  ngOnDestroy(): void {
    this.templates$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog(result?: CreateFileDialogResult): void {
    this.dialogRef.close(result);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  confirm(): void {
    const formValues: CreateFileFormValues = this.form.getRawValue();

    const folder = (formValues.folder ?? '').trim();
    const name = SanitizeHelper.sanitizePath(formValues.finalName.trim());

    const result: CreateFileDialogResult = {
      name: `${folder}${folder ? '/' : ''}${name}`.replace(/\/{2,}/g, ''),
      templateKey: formValues.templateKey,
    };
    this.closeDialog(result);
  }

  private fetchTemplates(): void {
    this.sourceService.getPredefinedTemplates().subscribe(templates => {
      this.templates$.next(templates);
    });
  }

  private buildForm(): void {
    this.form = new FormGroup({
      platform: new FormControl(this.all, Validators.required),
      purpose: new FormControl(this.all, Validators.required),
      templateKey: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      finalName: new FormControl({ value: null, disabled: true }),
      folder: new FormControl({ value: this.dialogData.folder, disabled: true }),
    });

    this.controls = this.form.controls as any;

    this.subscription.add(
      combineLatest([
        this.templates$,
        this.controls.templateKey.valueChanges.pipe(
          startWith<string, string>(this.controls.templateKey.value),
        ),
        this.controls.name.valueChanges.pipe(
          startWith<string, string>(this.controls.name.value),
        ),
      ]).subscribe(([templates, templateKey, name]) => {
        const template = templates.find(t => t.Key === templateKey);
        const finalName = name
          ? `${template?.Prefix ?? ''}${name}${template?.Extension ?? ''}`
          : null;

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
          template.Platforms.forEach(platform => {
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
        startWith<string, string>(this.controls.platform.value),
      ),
      this.controls.purpose.valueChanges.pipe(
        startWith<string, string>(this.controls.purpose.value),
      ),
    ]).pipe(
      map(([templates, platform, purpose]) => {
        const filtered = templates.filter(template => {
          const platformMatch = platform === this.all || template.Platforms.includes(platform);
          const purposeMatch = purpose === this.all || template.Purpose === purpose;
          return platformMatch && purposeMatch;
        });
        return filtered;
      }),
    );
    const preview$ = combineLatest([
      this.templates$,
      this.controls.templateKey.valueChanges.pipe(
        startWith<string, string>(this.controls.templateKey.value),
      ),
    ]).pipe(
      map(([templates, templateKey]) => templates.find(t => t.Key === templateKey)?.Body),
    );
    this.templateVars$ = combineLatest([platforms$, purposes$, templates$, preview$]).pipe(
      map(([platforms, purposes, templates, preview]) => {
        const templateVars: CreateFileTemplateVars = {
          platforms,
          purposes,
          templates,
          preview,
        };
        return templateVars;
      }),
    );
  }
}
