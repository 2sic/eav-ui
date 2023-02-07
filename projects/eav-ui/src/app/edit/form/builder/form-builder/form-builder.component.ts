import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { combineLatest, distinctUntilChanged, map, startWith, Subscription } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { GeneralHelpers, ValidationHelpers } from '../../../shared/helpers';
import { FormValues, SxcAbstractControl } from '../../../shared/models';
import { EavService, FieldsSettingsService, FieldsTranslateService, FormsStateService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  providers: [FieldsSettingsService, FieldsTranslateService],
})
export class FormBuilderComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  form: UntypedFormGroup;

  constructor(
    public fieldsSettingsService: FieldsSettingsService,
    private fieldsTranslateService: FieldsTranslateService,
    private formBuilder: UntypedFormBuilder,
    private eavService: EavService,
    private formsStateService: FormsStateService,
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
  ) {
    super();
   }

  ngOnInit() {
    this.fieldsSettingsService.init(this.entityGuid);
    this.fieldsTranslateService.init(this.entityGuid);

    this.form = new UntypedFormGroup({});
    this.subscription.add(
      this.fieldsSettingsService.getFieldsProps$().subscribe(fieldsProps => {
        // 1. create missing controls
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          const inputType = fieldProps.calculatedInputType.inputType;
          const empties: string[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd, InputTypeConstants.EmptyMessage];
          if (empties.includes(inputType)) { continue; }

          if (this.form.controls.hasOwnProperty(fieldName)) { continue; }

          const value = fieldProps.value;
          const disabled = fieldProps.settings.Disabled;
          const validators = ValidationHelpers.getValidators(fieldName, inputType, this.fieldsSettingsService);
          const newControl = this.formBuilder.control({ disabled, value }, validators);
          // TODO: build all fields at once. That should be faster
          this.form.addControl(fieldName, newControl);
          ValidationHelpers.ensureWarning(this.form.controls[fieldName]);
        }

        // 2. sync values
        const oldValues: FormValues = this.form.getRawValue();
        const newValues: FormValues = {};
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!this.form.controls.hasOwnProperty(fieldName)) { continue; }
          newValues[fieldName] = fieldProps.value;
        }

        const changes = GeneralHelpers.getFormChanges(oldValues, newValues);
        if (changes != null) {
          // controls probably don't need to set touched and dirty for this kind of update.
          // This update usually happens for language change, formula or updates on same entity in another Edit Ui.
          // In case controls should be updated, update with control.markAsTouched and control.markAsDirty.
          // Marking the form will not mark controls, but marking controls marks the form
          this.form.patchValue(changes);
        }

        // 3. sync disabled
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!this.form.controls.hasOwnProperty(fieldName)) { continue; }
          const control = this.form.controls[fieldName];
          const disabled = fieldProps.settings.Disabled;
          // WARNING!!! Fires valueChange event for every single control
          GeneralHelpers.disableControl(control, disabled);
        }

        // 4. run validators - required because formulas can recalculate validators and if value doesn't change, new validator will not run
        for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
          if (!this.form.controls.hasOwnProperty(fieldName)) { continue; }
          const control = this.form.controls[fieldName];
          control.updateValueAndValidity();
        }
      })
    );

    const formValid$ = this.form.valueChanges.pipe(
      map(() => !this.form.invalid),
      startWith(!this.form.invalid),
      distinctUntilChanged(),
    );
    const itemHeader$ = this.itemService.getItemHeader$(this.entityGuid);
    this.subscription.add(
      combineLatest([formValid$, itemHeader$]).pipe(
        map(([formValid, itemHeader]) => {
          if (itemHeader.IsEmpty) { return true; }
          return formValid;
        }),
        distinctUntilChanged(),
      ).subscribe(isValid => {
        this.formsStateService.setFormValid(this.entityGuid, isValid);
      })
    );
    this.subscription.add(
      this.form.valueChanges.pipe(
        map(() => this.form.dirty),
        startWith(this.form.dirty),
        // distinctUntilChanged(), // cant have distinctUntilChanged because dirty state is not reset on form save
      ).subscribe(isDirty => {
        this.formsStateService.setFormDirty(this.entityGuid, isDirty);
      })
    );

    this.subscription.add(
      this.form.valueChanges.pipe(
        map(() => this.form.getRawValue() as FormValues),
        distinctUntilChanged((previous, current) => GeneralHelpers.getFormChanges(previous, current) == null),
      ).subscribe((formValues) => {
        const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
        const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
        this.itemService.updateItemAttributesValues(this.entityGuid, formValues, currentLanguage, defaultLanguage);
      })
    );
  }

  ngOnDestroy() {
    Object.values(this.form.controls).forEach((control: SxcAbstractControl) => {
      control._warning$.complete();
    });
    super.ngOnDestroy();
  }
}
