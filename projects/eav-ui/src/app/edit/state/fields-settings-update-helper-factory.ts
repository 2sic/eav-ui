import { Signal } from '@angular/core';
import { classLog } from '../../../../../shared/logging';
import { DebugFields } from '../edit-debug';
import { FieldSettingsTools } from '../fields/logic/field-settings-tools';
import { FormLanguage } from '../form/form-languages.model';
import { EavContentTypeAttribute, EavEntity, EavField } from '../shared/models/eav';
import { FieldConstantsOfLanguage } from './fields-configs.model';
import { FieldSettingsUpdateHelper } from './fields-settings-update-helper';

const logSpecs = {
  all: false,
  fields: [...DebugFields], // or '*' for all
};

/**
 * Factory for creating FieldSettingsUpdateHelper instances,
 * which make sure that the settings are always in a clean / filled state and matching requirements.
 */
export class FieldSettingsUpdateHelperFactory {
  log = classLog({FieldSettingsUpdateHelperFactory}, logSpecs);
  constructor(
    // General & Content Type Info
    private contentTypeMetadata: EavEntity[],
    private language: FormLanguage,
    /** set of configuration for running field logic - shared */
    private fieldSettingsTools: FieldSettingsTools,
    /** Info that the form is read-only */
    private formReadOnly: boolean,
    private slotIsEmpty: Signal<boolean>,
  ) { }

  create(
    fieldName: string,
    attribute: EavContentTypeAttribute,
    constantFieldPart: FieldConstantsOfLanguage,
    attributeValues: EavField<any>,
  ): FieldSettingsUpdateHelper {
    return new FieldSettingsUpdateHelper(
      fieldName,
      this.contentTypeMetadata,
      this.language,
      this.fieldSettingsTools,
      this.formReadOnly,
      this.slotIsEmpty,
      attribute,
      constantFieldPart,
      attributeValues,
    );
  }
}
