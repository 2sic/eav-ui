import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { SanitizeHelper } from '../../../../../edit/shared/helpers';
import { defaultControllerName, defaultTemplateName } from '../../shared/constants/file-names.constants';
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
  nameControl: AbstractControl;
  templateKeyControl: AbstractControl;
  extensionControl: AbstractControl;
  folderControl: AbstractControl;
  templateVars$: Observable<CreateFileTemplateVars>;

  private guidedType$: BehaviorSubject<boolean>;
  private templates$: BehaviorSubject<PredefinedTemplate[]>;
  private subscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: CreateFileDialogData,
    private dialogRef: MatDialogRef<CreateFileDialogComponent>,
    private sourceService: SourceService,
  ) { }

  ngOnInit(): void {
    this.subscription = new Subscription();
    this.guidedType$ = new BehaviorSubject(true);
    this.templates$ = new BehaviorSubject<PredefinedTemplate[]>([]);
    this.sourceService.getPredefinedTemplates().subscribe(templates => {
      this.templates$.next(templates);
    });
    this.buildForm();
    this.formFixes();

    this.templateVars$ = combineLatest([this.guidedType$, this.templates$]).pipe(
      map(([guidedType, templates]) => {
        const templateVars: CreateFileTemplateVars = {
          guidedType,
          templates,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    this.guidedType$.complete();
    this.templates$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog(result?: CreateFileDialogResult): void {
    this.dialogRef.close(result);
  }

  toggleGuidedType(newGuidedType: boolean): void {
    if (this.guidedType$.value === newGuidedType) { return; }
    this.guidedType$.next(newGuidedType);
  }

  confirm(): void {
    const formValues: CreateFileFormValues = this.form.getRawValue();

    const folder = (formValues.folder ?? '').trim();
    const name = SanitizeHelper.sanitizePath(formValues.name.trim());
    const extension = formValues.extension.trim();
    const fullName = `${folder}${folder ? '/' : ''}${name}${extension.startsWith('.') ? '' : '.'}${extension}`.replace(/\/{2,}/g, '');

    const result: CreateFileDialogResult = {
      name: fullName,
      templateKey: this.guidedType$.value ? formValues.templateKey : undefined,
    };
    this.closeDialog(result);
  }

  private buildForm(): void {
    const folderPrefill = this.dialogData.folder;
    const defaultName = (folderPrefill === 'api' || folderPrefill?.startsWith('api/')) ? defaultControllerName : defaultTemplateName;
    const namePrefill = defaultName.substring(0, defaultName.lastIndexOf('.'));
    const extPrefill = defaultName.substring(defaultName.lastIndexOf('.'));

    this.form = new FormGroup({
      name: new FormControl(namePrefill, [Validators.required]),
      templateKey: new FormControl(null, [Validators.required]),
      extension: new FormControl(extPrefill, [Validators.required]),
      folder: new FormControl({ disabled: true, value: folderPrefill }),
    });
    this.nameControl = this.form.controls.name;
    this.templateKeyControl = this.form.controls.templateKey;
    this.extensionControl = this.form.controls.extension;
    this.folderControl = this.form.controls.folder;
  }

  private formFixes(): void {
    this.subscription.add(
      this.guidedType$.pipe(
        distinctUntilChanged(),
      ).subscribe(guidedType => {
        // reset extension value when template picker is activated
        if (guidedType) {
          const templates = this.templates$.value;
          const selectedKey = this.templateKeyControl.value;
          const templateExt = templates.find(t => t.Key === selectedKey)?.Extension;
          if (this.extensionControl.value !== templateExt) {
            this.extensionControl.patchValue(templateExt);
          }
        }
        // disable template picker control when it's not active to allow form to be valid
        if (guidedType && this.templateKeyControl.disabled) {
          this.templateKeyControl.enable();
        } else if (!guidedType && this.templateKeyControl.enabled) {
          this.templateKeyControl.disable();
        }
      })
    );

    // change extension when template is changed
    this.subscription.add(
      combineLatest([
        this.templateKeyControl.valueChanges.pipe(
          startWith<string, string>(this.templateKeyControl.value),
          distinctUntilChanged(),
        ),
        this.templates$,
      ]).pipe(
        filter(() => this.guidedType$.value),
      ).subscribe(([templateKey, templates]) => {
        const templateExt = templates?.find(t => t.Key === templateKey)?.Extension;
        if (templateExt) {
          this.extensionControl.patchValue(templateExt);
        }
      })
    );
  }
}
