import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { SanitizeHelper } from '../../../../../edit/shared/helpers';
import { PredefinedTemplate } from '../models/predefined-template.model';
import { SourceService } from '../services/source.service';
import { CreateFileDialogData, CreateFileDialogResult, CreateFileFormValues, CreateFileTemplateVars } from './create-file-dialog.models';

@Component({
  selector: 'app-create-file-dialog',
  templateUrl: './create-file-dialog.component.html',
  styleUrls: ['./create-file-dialog.component.scss']
})
export class CreateFileDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  templateVars$: Observable<CreateFileTemplateVars>;
  guidedType = true;

  private predefinedTemplates$: BehaviorSubject<PredefinedTemplate[]>;
  private subscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: CreateFileDialogData,
    private dialogRef: MatDialogRef<CreateFileDialogComponent>,
    private sourceService: SourceService,
  ) { }

  ngOnInit(): void {
    this.subscription = new Subscription();
    this.predefinedTemplates$ = new BehaviorSubject<PredefinedTemplate[]>([]);

    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      extension: new FormControl(null, [Validators.required]),
      folder: new FormControl({ disabled: true, value: this.dialogData.folder }),
    });

    this.subscription.add(
      combineLatest([
        this.form.controls.type.valueChanges.pipe(
          startWith<string, string>(this.form.controls.type.value),
          filter(type => !!type),
          distinctUntilChanged(),
        ),
        this.predefinedTemplates$.pipe(
          filter(templates => !!templates),
        ),
      ]).pipe(
        filter(() => this.guidedType),
      ).subscribe(([type, predefinedTemplates]) => {
        const extension = predefinedTemplates.find(t => t.Key === type)?.Extension;
        if (!extension) { return; }

        this.form.controls.extension.patchValue(extension);
      })
    );

    this.sourceService.getPredefinedTemplates().subscribe(predefinedTemplates => {
      this.predefinedTemplates$.next(predefinedTemplates);
    });

    this.templateVars$ = combineLatest([this.predefinedTemplates$]).pipe(
      map(([predefinedTemplates]) => {
        const templateVars: CreateFileTemplateVars = {
          predefinedTemplates,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    this.predefinedTemplates$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog(result?: CreateFileDialogResult): void {
    this.dialogRef.close(result);
  }

  toggleGuidedType(newGuidedType: boolean): void {
    if (this.guidedType === newGuidedType) { return; }

    this.guidedType = newGuidedType;

    // if typeControl is not active, disable it to allow form to be valid without it
    const typeControl = this.form.controls.type;
    if (this.guidedType && typeControl.disabled) {
      typeControl.enable();
    } else if (!this.guidedType && typeControl.enabled) {
      typeControl.disable();
    }
  }

  confirm(): void {
    const formValues: CreateFileFormValues = this.form.getRawValue();

    const folder = (formValues.folder ?? '').trim();
    const name = SanitizeHelper.sanitizePath(formValues.name.trim());
    const extension = formValues.extension.trim();
    const fullName = `${folder}${folder ? '/' : ''}${name}${extension.startsWith('.') ? '' : '.'}${extension}`.replace(/\/{2,}/g, '');

    const result: CreateFileDialogResult = {
      name: fullName,
      templateKey: this.guidedType ? formValues.type : undefined,
    };
    this.closeDialog(result);
  }
}
