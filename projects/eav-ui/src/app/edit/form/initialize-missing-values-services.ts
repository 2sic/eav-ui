import { Injectable } from '@angular/core';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';
import { classLogEnabled } from '../../shared/logging';
import { DebugFields } from '../edit-debug';
import { FieldSettingsHelpersManager } from '../fields/logic/field-settings-helpers-manager';
import { FieldReader } from '../localization/field-reader';
import { LanguageService } from '../localization/language.service';
import { ContentTypeService } from '../shared/content-types/content-type.service';
import { EntityReader } from '../shared/helpers';
import { InputTypeService } from '../shared/input-types/input-type.service';
import { FieldsSettingsHelpers } from '../state/field-settings.helper';
import { ItemService } from '../state/item.service';
import { FormConfigService } from './form-config.service';

const logSpecs = {
  all: false,
  constructor: false,
  initMissingValues: true,
  fields: [...DebugFields, 'releases'],
};

/**
 * Special service to initialize missing values in the edit form.
 * This is used to set default values for fields which are empty or null.
 * It also handles complex initialization logic based on the available languages and input types.
 * 
 * Note that it does use the ItemService to update the items, so it has a side-effect.
 */
@Injectable()
export class InitializeMissingValuesServices {
  log = classLogEnabled({InitializeMissingValuesServices}, logSpecs);
  
  // This is a helper class to initialize the missing values services
  // It is used in the EditInitializerService to initialize the missing values services
  // It is not used anywhere else, but it is a good practice to keep it in a separate file
  // for better readability and maintainability.
  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeService: ContentTypeService,
    private languageService: LanguageService,
  ) { }

  initMissingValues(): boolean {
    const lMain = this.log.fnIf('initMissingValues');

    const updater = this.itemService.updater;
    const eavConfig = this.formConfig.config;
    const items = this.itemService.getMany(eavConfig.itemGuids);
    const inputTypes = this.inputTypeService.getAll();
    const languages = this.languageService.getAll();
    const language = this.formConfig.language();
    const logicManager = FieldSettingsHelpersManager.singleton();

    /** force UI to switch to default language, because some values are missing in the default language */
    let switchToDefault = false;
    const isCreateMode = eavConfig.createMode;

    const fss = new FieldsSettingsHelpers("EditInitializerService");

    for (const item of items) {
      const contentType = this.contentTypeService.getContentTypeOfItem(item);

      for (const ctAttribute of contentType.Attributes) {
        const currentName = ctAttribute.Name;
        const l = this.log.fnIfInFields('initMissingValues', currentName);

        const inputType = inputTypes.find(i => i.Type === ctAttribute.InputType);
        const isEmptyType = InputTypeHelpers.isEmpty(inputType?.Type);
        l.a(`Attribute: '${currentName}' InputType: '${inputType?.Type}' isEmptyType: '${isEmptyType}'`);

        if (isEmptyType)
          continue;

        const logic = logicManager.getOrUnknown(inputType?.Type);

        const attributeValues = item.Entity.Attributes[ctAttribute.Name];
        const fieldSettings = fss.getDefaultSettings(
          new EntityReader(language.primary, language.primary).flatten(ctAttribute.Metadata)
        );

        // The type is needed for empty checks
        const fieldType = ctAttribute.InputType.split('-')[0];

        if (languages.length === 0) {
          l.a(`${currentName} languages none, simple init`);
          const firstValue = new FieldReader(attributeValues, '*').currentOrDefaultOrAny?.value;

          // console.log('2dm: empty values no lang', { item, ctAttribute, firstValue, isCreateMode });

          if (logic.isValueEmpty(fieldType, firstValue, isCreateMode))
            updater.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, language.primary);
        } else {
          l.a(`${currentName} languages many, complex init`);

          // check if there is a value for the generic / all language
          const disableI18n = inputType?.DisableI18n;
          const noLanguageValue = new FieldReader(attributeValues, '*').currentOrDefault?.value;
          l.a(currentName, { disableI18n, noLanguageValue });
          if (!disableI18n && noLanguageValue !== undefined) {
            // move * value to defaultLanguage
            const transactionItem = updater.removeItemAttributeDimension(item.Entity.Guid, ctAttribute.Name, '*', true);
            updater.addItemAttributeValue(
              item.Entity.Guid,
              ctAttribute.Name,
              noLanguageValue,
              language.primary,
              false,
              ctAttribute.Type,
              false,
              transactionItem,
            );
            l.a(`${currentName} exit`);
            continue;
          }

          const defaultLanguageValue = new FieldReader(attributeValues, language.primary).currentOrDefault?.value;

          const valueIsEmpty = logic.isValueEmpty(fieldType, defaultLanguageValue, isCreateMode);

          // if (currentName === 'releases')
          //   console.log('2dm: empty values langs', { currentName, item, ctAttribute, defaultLanguageValue, isCreateMode, valueIsEmpty });

          l.a(currentName, { currentName, valueIsEmpty, defaultLanguageValue, isCreateMode });

          // if (currentName === 'releases' && valueIsEmpty)
          //   debugger;

          if (valueIsEmpty) {
            const valUsed = updater.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, language.primary);

            // 2022-08-15 2dm added this
            // If we run into more problems (like required date-fields which result in null)
            // we may have to update the logic to use FieldLogicBase and add rules for each type what would be valid
            // or test for IsRequired as well

            // If the primary language isn't ready, enforce switch-to-default
            // Skip this for ephemeral fields as they never load with content
            // Also switch for fields which use null as default (like boolean-tristate) as this kind of "empty" is valid
            if (valUsed != null && !fieldSettings.IsEphemeral)
              switchToDefault = true;
          }
        }
      }
    }

    return lMain.r(switchToDefault);
  }

}