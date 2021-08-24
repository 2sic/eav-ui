import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GeneralHelpers } from '../../../../../edit/shared/helpers';
import { eavConstants, EavKeyTypes } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { MetadataDialogTemplateVars, MetadataFormValues, MetadataInfo, TargetTypeOption } from './create-metadata-dialog.models';
import { metadataKeyValidator } from './metadata-key.validator';

@Component({
  selector: 'app-create-metadata-dialog',
  templateUrl: './create-metadata-dialog.component.html',
  styleUrls: ['./create-metadata-dialog.component.scss']
})
export class CreateMetadataDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  eavConstants = eavConstants;
  form: FormGroup;
  templateVars$: Observable<MetadataDialogTemplateVars>;

  /** Constants from metadata definitions */
  private targetTypeOptions: TargetTypeOption[];
  /** Constants from metadata definitions */
  private keyTypeOptions: string[];
  private advancedMode$: BehaviorSubject<boolean>;
  /** Currently available options */
  private targetTypeOptions$: BehaviorSubject<TargetTypeOption[]>;
  /** Currently available options */
  private keyTypeOptions$: BehaviorSubject<string[]>;
  private subscription: Subscription;

  constructor(private dialogRef: MatDialogRef<CreateMetadataDialogComponent>, private context: Context) { }

  ngOnInit(): void {
    this.subscription = new Subscription();
    this.targetTypeOptions = Object.values(eavConstants.metadata).map(option => ({ ...option }));
    this.keyTypeOptions = Object.values(eavConstants.keyTypes);

    this.targetTypeOptions$ = new BehaviorSubject([]);
    this.keyTypeOptions$ = new BehaviorSubject([]);
    this.advancedMode$ = new BehaviorSubject(false);

    this.form = new FormGroup({});
    this.form.addControl('targetType', new FormControl(eavConstants.metadata.entity.type, [Validators.required, Validators.pattern(/^[0-9]+$/)]));
    this.form.addControl('keyType', new FormControl(eavConstants.keyTypes.number, [Validators.required]));
    this.form.addControl('key', new FormControl(null, [Validators.required, metadataKeyValidator(this.form)]));

    const formValues$: Observable<MetadataFormValues> = this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      map(() => this.form.getRawValue()),
    );

    this.subscription.add(
      combineLatest([formValues$, this.advancedMode$]).subscribe(([formValues, advancedMode]) => {
        // targetTypeOptions are constants, but can also include manual value in advanced mode
        const unknownTargetType = !this.targetTypeOptions.some(option => option.type === formValues.targetType);
        if (unknownTargetType) {
          const unknownOption: TargetTypeOption = {
            type: formValues.targetType,
            label: formValues.targetType?.toString(),
            keyType: undefined,
            target: formValues.targetType?.toString(),
          };
          this.targetTypeOptions$.next([...this.targetTypeOptions, unknownOption]);
        } else {
          this.targetTypeOptions$.next([...this.targetTypeOptions]);
        }

        // keyTypeOptions depend on targetType and advanced
        if (advancedMode || unknownTargetType) {
          this.keyTypeOptions$.next([...this.keyTypeOptions]);
        } else {
          const selectedTargetType = this.targetTypeOptions.find(option => option.type === formValues.targetType);
          this.keyTypeOptions$.next([selectedTargetType.keyType]);
        }

        // update form if keyType is not available or key is of incorrect type
        const updatedForm: Partial<MetadataFormValues> = {};
        if (!this.keyTypeOptions$.value.includes(formValues.keyType)) {
          updatedForm.keyType = this.keyTypeOptions$.value[0];
        }

        const typeofKey = (updatedForm.keyType ?? formValues.keyType) === EavKeyTypes.Number ? EavKeyTypes.Number : EavKeyTypes.String;
        if (formValues.key != null && typeof formValues.key !== typeofKey) {
          updatedForm.key = null;
        }

        const isAppMetadata = !advancedMode && formValues.targetType === eavConstants.metadata.app.type;
        if (isAppMetadata && formValues.key !== this.context.appId) {
          updatedForm.key = this.context.appId;
        }

        if (Object.keys(updatedForm).length) {
          this.form.patchValue(updatedForm);
        }

        const keyTypeDisabled = !advancedMode && this.keyTypeOptions$.value.length <= 1;
        GeneralHelpers.disableControl(this.form.controls['keyType'], keyTypeDisabled);
        GeneralHelpers.disableControl(this.form.controls['key'], isAppMetadata);
      })
    );

    this.templateVars$ = combineLatest([this.advancedMode$, this.targetTypeOptions$, this.keyTypeOptions$, formValues$]).pipe(
      map(([advancedMode, targetTypeOptions, keyTypeOptions, formValues]) => {
        const templateVars: MetadataDialogTemplateVars = {
          advancedMode,
          unknownTargetType: !this.targetTypeOptions.some(option => option.type === formValues.targetType),
          targetTypeOptions,
          targetTypeHint: !advancedMode && targetTypeOptions.find(option => option.type === formValues.targetType)?.hint,
          keyTypeOptions,
          formValues,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    this.advancedMode$.complete();
    this.targetTypeOptions$.complete();
    this.keyTypeOptions$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog(result?: MetadataInfo): void {
    this.dialogRef.close(result);
  }

  toggleAdvanced(event: MatSlideToggleChange): void {
    this.advancedMode$.next(event.checked);
  }

  confirm(): void {
    const formValues: MetadataFormValues = this.form.getRawValue();
    // if not a known target, use the number
    const target = this.targetTypeOptions.find(option => option.type === formValues.targetType)?.target ?? formValues.targetType.toString();

    const result: MetadataInfo = {
      target,
      keyType: formValues.keyType,
      key: formValues.key.toString(),
    };
    this.closeDialog(result);
  }
}
