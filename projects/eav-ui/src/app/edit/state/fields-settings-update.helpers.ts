import { Signal } from '@angular/core';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { classLog } from '../../shared/logging';
import { DebugFields } from '../edit-debug';
import { FieldSettingsTools } from '../fields/logic/field-settings-tools';
import { FormLanguage } from '../form/form-languages.model';
import { FieldReader } from '../localization/field-reader';
import { EavContentTypeAttribute, EavEntity, EavField } from '../shared/models/eav';
import { ValidationHelpers } from '../shared/validation/validation.helpers';
import { FieldConstantsOfLanguage } from './fields-configs.model';
import { MetadataDecorators } from './metadata-decorators.constants';

const logSpecs = {
  all: false,
  correctSettingsAfterChanges: true,
  schemaDisablesTranslation: false,
  getDisabledBecauseTranslations: false,
  fields: [...DebugFields], // or '*' for all
};

export class FieldSettingsUpdateHelperFactory {
  log = classLog({FieldSettingsUpdateHelperFactory});
  constructor(
    // General & Content Type Info
    private contentTypeMetadata: EavEntity[],
    private language: FormLanguage,
    /** set of configuration for running field logic - shared */
    private fieldLogicTools: FieldSettingsTools,
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
      this.fieldLogicTools,
      this.formReadOnly,
      this.slotIsEmpty,
      attribute,
      constantFieldPart,
      attributeValues,
    );
  }
}

/**
 * Special helper to check if a field should remain disabled because of various language settings.
 * 
 * Only used in formulas, after running formulas which modify settings.
 * 
 * Each one is specific to a certain field, so you must create another object for every field you check.
 */
export class FieldSettingsUpdateHelper {

  log = classLog({FieldSettingsUpdateHelper}, logSpecs);

  constructor(
    private fieldName: string,
    // General & Content Type Info
    private contentTypeMetadata: EavEntity[],
    private language: FormLanguage,
    /** set of configuration for running field logic - shared */
    private fieldLogicTools: FieldSettingsTools,
    /** Info that the form is read-only */
    private formReadOnly: boolean,
    private formSlotIsEmpty: Signal<boolean>,

    // Field specific info
    private attribute: EavContentTypeAttribute,
    private constantFieldPart: FieldConstantsOfLanguage,
    private attributeValues: EavField<any>,
  ) { }

  /**
   * Used for verifying and updating new settings.
   * @param settings Latest/newest settings
   * @param fieldValue
   * @returns Corrected settings
   */
  correctSettingsAfterChanges(settings: FieldSettings, fieldValue: FieldValue): FieldSettings {
    const l = this.log.fnIfInFields('correctSettingsAfterChanges', this.fieldName, () => ({ settings, fieldValue }));

    const constantFieldPart = this.constantFieldPart;
    const slotIsEmpty = this.formSlotIsEmpty();

    // Why are we doing this?
    settings.Name = settings.Name || this.attribute.Name;

    settings.valueRequired = ValidationHelpers.isRequired(settings);
    const disableTranslation = this.#schemaDisablesTranslation();

    settings.DisableTranslation = slotIsEmpty || disableTranslation;
    settings.uiDisabledInThisLanguage = this.#getDisabledBecauseTranslations(settings.DisableTranslation);

    settings.uiDisabledForced = slotIsEmpty || settings.uiDisabledInThisLanguage || this.formReadOnly;

    settings.uiDisabled = settings.uiDisabledForced || settings.Disabled;

    settings.DisableAutoTranslation = constantFieldPart.settingsInitial.DisableAutoTranslation
      || settings.DisableTranslation;

    // Correct these fresh settings with FieldLogics of this field
    const fixed = constantFieldPart.logic?.update({ fieldName: this.fieldName, settings: settings, value: fieldValue, tools: this.fieldLogicTools }) ?? settings;

    return l.r(fixed);
  }


  /** Find if DisableTranslation is true in any setting and in any language */
  #schemaDisablesTranslation(): boolean {
    const l = this.log.fnIfInFields('schemaDisablesTranslation', this.fieldName);
    const contentTypeMetadata = this.contentTypeMetadata;
    const inputType = this.constantFieldPart.inputTypeConfiguration;
    const attributeValues = this.attributeValues;
    const attributeMetadata = this.attribute.Metadata;

    // Disable translation if not allowed by the ContentType.
    // This is configured using a LanguagesDecorator in ContentType.
    const languagesDecorator = contentTypeMetadata.find(m => m.Type.Name === MetadataDecorators.LanguagesDecorator);
    if (languagesDecorator?.Attributes.Enabled?.Values.some(v => v.value === false))
      return true;

    // Disable translation if the input type says it can't be translated (e.g. Entity).
    if (inputType?.DisableI18n)
      return true;

    // TODO: CHECK if this should be here - it's repeated below
    if (!new FieldReader(attributeValues, this.language).hasPrimary)
      return true;

    // Disable translation if the Attribute Configuration says so.
    // DisableTranslation is true in any language in @All, @String, @string-default, etc...
    for (const attrMd of attributeMetadata ?? [])
      if (attrMd.Attributes.DisableTranslation?.Values.some(v => v.value === true))
        return true;

    return false;
  }

  #getDisabledBecauseTranslations(disableTranslation: boolean): boolean {
    const l = this.log.fnIfInFields('getDisabledBecauseTranslations', this.fieldName);
    const attributeValues = this.attributeValues;
    const language = this.language;
    // On primary edit is never disabled by translations
    // This is the only one we check 
    if (language.current === language.primary)
      return l.r(false, 'enabled, primary language');

    const fieldReader = new FieldReader(attributeValues, language);
    // If translations are disabled, then it's disabled
    // Only check this _after_ checking if we're in the primary language
    if (disableTranslation)
      return l.r(true, 'disabled, disableTranslation');
    // If no value on primary, then it's disabled
    if (!fieldReader.hasPrimary)
      return l.r(true, 'disabled, no value on primary');
    if (fieldReader.hasEditableValues)
      return l.r(false, 'disabled, has editable value');
    if (fieldReader.hasCurrentReadonly)
      return l.r(true, 'enabled, has readonly value');
    return l.r(true, 'enabled, no rule applies');
  }
}
