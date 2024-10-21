import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { classLog } from '../../../shared/logging';
import { FieldLogicManager } from '../../fields/logic/field-logic-manager';
import { FieldLogicWithValueInit } from '../../fields/logic/field-logic-with-init';
import { AdamCacheService } from '../../shared/adam/adam-cache.service';
import { ValidationHelpers, ValidationHelperSpecs } from '../../shared/validation/validation.helpers';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { EntityFormStateService } from '../entity-form-state.service';
import { FieldInitSpecs } from './field-init-specs.model';

@Injectable()
export class FormFieldsBuilderService {

  log = classLog({FormFieldsBuilderService}, null);

  constructor(
    private fieldsSettingsSvc: FieldsSettingsService,
    private adamCacheSvc: AdamCacheService,
    private formBuilder: UntypedFormBuilder,
    private entityFormConfigSvc: EntityFormStateService,
  ) { }

  public createFields(entityGuid: string, form: UntypedFormGroup, allFields: FieldInitSpecs[]) {

    const l = this.log.fn('createFields');

    // 1. create missing controls - usually just on first cycle
    const fieldsToCreate = allFields.filter(({ inputType, hasControl }) =>
      !InputTypeHelpers.isEmpty(inputType)    // Empty type, skip
      && !hasControl                          // If control already exists, skip
    );

    this.log.a(`create missing controls ${fieldsToCreate.length} of ${allFields.length}`, { fieldsForNgForm: fieldsToCreate });

    // Generate any fields which don't exist yet (usually only on first cycle)
    for (const fields of fieldsToCreate) {
      const { name: fieldName, props: fieldProps, inputType, value } = fields;
      // The initial value at the moment the control is first created in this language
      let initialValue = value;

      // Special treatment for wysiwyg fields
      // Note by 2dm 2024-08-19 - not sure if this actually works, because the changed buildValue is maybe never reused
      // ...except for directly below
      if (inputType === InputTypeCatalog.StringWysiwyg && initialValue) {
        const logic = FieldLogicManager.singleton().get(InputTypeCatalog.StringWysiwyg);
        const adamItems = this.adamCacheSvc.getAdamSnapshot(entityGuid, fieldName);
        fields.value = initialValue = (logic as unknown as FieldLogicWithValueInit).processValueOnLoad(initialValue, adamItems);
      }

      // Build control in the Angular form with validators
      const disabled = fieldProps.settings.uiDisabled;
      const fss = this.fieldsSettingsSvc;
      const valSpecs = new ValidationHelperSpecs(fieldName, inputType, fss.settings[fieldName], fss.fieldProps[fieldName]);
      const validators = ValidationHelpers.getValidators(valSpecs, inputType);
      const newControl = this.formBuilder.control({ disabled, value: initialValue }, validators);
      // TODO: build all fields at once. That should be faster
      form.addControl(fieldName, newControl);
      ValidationHelpers.ensureWarning(form.controls[fieldName]);
    }

    this.entityFormConfigSvc.controlsCreated.set(true);
    l.end();
  }
}


