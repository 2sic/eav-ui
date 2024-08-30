import { Injectable, Injector } from '@angular/core';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { filter, map, Observable, take } from 'rxjs';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { ServiceBase } from '../../../shared/services/service-base';
import { InputTypeCatalog, InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { FieldLogicManager } from '../../fields/logic/field-logic-manager';
import { FieldLogicWithValueInit } from '../../fields/logic/field-logic-with-init';
import { ValidationHelpers } from '../../shared/validation/validation.helpers';
import { FieldProps } from '../../state/fields-configs.model';
import { FieldValue } from '../../../../../../edit-types';
import { ControlHelpers } from '../../shared/helpers/control.helpers';
import { FieldValueHelpers } from '../../shared/helpers/FieldValueHelpers';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { EntityFormStateService } from '../entity-form-state.service';
import { AdamCacheService } from '../../shared/store/adam-cache.service';
import { toObservable } from '@angular/core/rxjs-interop';

const logThis = false;
const nameOfThis = 'FormFieldsBuilderService';

@Injectable()
export class FormFieldsBuilderService extends ServiceBase {

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private adamCacheService: AdamCacheService,
    private formBuilder: UntypedFormBuilder,
    private entityFormConfigSvc: EntityFormStateService,
    private injector: Injector,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  start(entityGuid: string, form: UntypedFormGroup) {
    const l = this.log.fn('start');

    const fieldProps = this.fieldsSettingsService.getFieldsPropsSignal();
    const fieldProps$ = toObservable(fieldProps, { injector: this.injector });

    // 1. Prepare: Take field props and enrich initial values and input types
    const fieldsToProcess: Observable<FieldToProcess[]> = fieldProps$.pipe(
      filter(fields => fields != null && Object.keys(fields).length > 0),
      map(allFields => {
        const fields: FieldToProcess[] = Object.entries(allFields).map(([fieldName, fieldProps]) => {
          const hasControl = form.controls.hasOwnProperty(fieldName);
          const control = hasControl ? form.controls[fieldName] : null;
          return {
            fieldName,
            fieldProps,
            inputType: fieldProps.constants.inputTypeSpecs.inputType,
            value: fieldProps.buildValue,
            hasControl,
            control,
          } satisfies FieldToProcess;
        });
        return fields;
      }),
    );

    // Create all the controls in the form right at the beginning
    fieldsToProcess.pipe(
      filter(fields => fields != null && fields.length > 0),
      take(1)
    ).subscribe(allFields => {
      this.createFields(entityGuid, form, allFields);
    });

    this.keepFieldsAndStateInSync(entityGuid, form, fieldsToProcess);

    l.end();
  }

  createFields(entityGuid: string, form: UntypedFormGroup, allFields: FieldToProcess[]) {
    const l = this.log.fn('createFields');

    // 1. create missing controls - usually just on first cycle
    const fieldsToCreate = allFields.filter(({ inputType, hasControl }) =>
      !InputTypeHelpers.isEmpty(inputType)    // Empty type, skip
      && !hasControl                          // If control already exists, skip
    );

    this.log.a(`create missing controls ${fieldsToCreate.length} of ${allFields.length}`, { fieldsForNgForm: fieldsToCreate });

    // Generate any fields which don't exist yet (usually only on first cycle)
    for (const fields of fieldsToCreate) {
      const { fieldName, fieldProps, inputType, value } = fields;
      // The initial value at the moment the control is first created in this language
      let initialValue = value;

      // Special treatment for wysiwyg fields
      // Note by 2dm 2024-08-19 - not sure if this actually works, because the changed buildValue is maybe never reused
      // ...except for directly below
      if (inputType === InputTypeCatalog.StringWysiwyg && initialValue) {
        const logic = FieldLogicManager.singleton().get(InputTypeCatalog.StringWysiwyg);
        const adamItems = this.adamCacheService.getAdamSnapshot(entityGuid, fieldName);
        fields.value = initialValue = (logic as unknown as FieldLogicWithValueInit).processValueOnLoad(initialValue, adamItems);
      }

      // Build control in the Angular form with validators
      const disabled = fieldProps.settings.Disabled || fieldProps.settings.ForcedDisabled;
      const validators = ValidationHelpers.getValidators(fieldName, inputType, this.fieldsSettingsService);
      const newControl = this.formBuilder.control({ disabled, value: initialValue }, validators);
      // TODO: build all fields at once. That should be faster
      form.addControl(fieldName, newControl);
      ValidationHelpers.ensureWarning(form.controls[fieldName]);
    }

    this.entityFormConfigSvc.controlsCreated.set(true);
    l.end();
  }

  keepFieldsAndStateInSync(entityGuid: string, form: UntypedFormGroup, fieldsToProcess: Observable<FieldToProcess[]>) {
    const l = this.log.fn('keepFieldsAndStateInSync');
    // This has multiple features, possibly we should separate them
    // 2. Sync values between form and fieldProps - eg. on value changes which are from formulas
    // 3. Ensure disabled state is in sync eg. after settings recalculations
    // 4. Ensure validators are run in such scenarios
    this.subscriptions.add(
      fieldsToProcess.subscribe(allFields => {
        // Figure out which fields may require further processing
        const fieldsOnForm = allFields.filter(set => set.hasControl);

        // 2. sync values - create list comparing the old raw values and new fieldProps - eg. modified by formulas
        this.log.a(`sync values for max ${fieldsOnForm.length} controls`);
        const oldValues: ItemValuesOfLanguage = form.getRawValue();
        const newValues: ItemValuesOfLanguage = {};
        for (const { fieldName, value } of fieldsOnForm)
          newValues[fieldName] = value;

        const changes = FieldValueHelpers.getItemValuesChanges(oldValues, newValues);
        if (changes != null) {
          this.log.a(`patching form as it changed (${Object.keys(changes).length}`, { changes, oldValues, newValues })
          // controls probably don't need to set touched and dirty for this kind of update.
          // This update usually happens for language change, formula or updates on same entity in another Edit Ui.
          // In case controls should be updated, update with control.markAsTouched and control.markAsDirty.
          // Marking the form will not mark controls, but marking controls marks the form
          form.patchValue(changes);
        } else
          this.log.a('no changes detected', { oldValues, newValues });

        // 3. sync disabled if state not matching
        this.log.a('sync "disabled" state');
        for (const { control, fieldProps } of fieldsOnForm) {
          const disabled = fieldProps.settings.Disabled || fieldProps.settings.ForcedDisabled;
          // WARNING!!! Fires valueChange event for every single control
          ControlHelpers.disableControl(control, disabled);
        }

        // 4. run validators - required because formulas can recalculate validators and if value doesn't change, new validator will not run
        this.log.a('run validators');
        for (const { control } of fieldsOnForm)
          control.updateValueAndValidity();
      })
    );

    l.end();
  }
}

interface FieldToProcess {
  fieldName: string;
  fieldProps: FieldProps;
  inputType: InputTypeStrict;
  value: FieldValue;
  hasControl: boolean;
  control: AbstractControl<any, any>;
}
