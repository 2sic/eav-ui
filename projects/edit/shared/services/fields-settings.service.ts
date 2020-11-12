import { Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import isEmpty from 'lodash-es/isEmpty';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigAngular, FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { EavAttributes, InputType, Item, Language } from '../models/eav';
import { AttributeDef } from '../models/eav/attribute-def';
import { FormulaFieldSettings } from '../models/formula.models';
import { CalculatedInputType } from '../models/input-field-models';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageService } from '../store/ngrx-data/language.service';

@Injectable()
export class FieldsSettingsService {

  constructor() { }

  public buildFieldConfig(
    attribute: AttributeDef,
    index: number,
    calculatedInputType: CalculatedInputType,
    contentTypeSettings: EavAttributes,
    isParentGroup: boolean,
    currentLanguage: string,
    defaultLanguage: string,
    item: Item,
    inputTypeService: InputTypeService,
    languageService: LanguageService,
    itemService: ItemService,
  ): FieldConfigAngular {
    let fieldConfig: FieldConfigAngular;
    let settingsTranslated: FieldSettings;
    let fullSettings: EavAttributes;
    const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);

    if (attribute) {
      settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, currentLanguage, defaultLanguage);
      fullSettings = attribute.settings;
    } else if (isEmptyInputType && contentTypeSettings) {
      settingsTranslated = LocalizationHelper.translateSettings(contentTypeSettings, currentLanguage, defaultLanguage);
      fullSettings = contentTypeSettings;
    }

    // these settings are recalculated in translate-group-menu translateAllConfiguration
    const name = attribute ? attribute.name : 'Edit Item';
    const label = attribute ? InputFieldHelper.getFieldLabel(attribute, settingsTranslated) : 'Edit Item';
    let inputTypeSettings: InputType;
    const disableI18n = LocalizationHelper.isI18nDisabled(inputTypeService, calculatedInputType, fullSettings);
    inputTypeService.getInputTypeById(calculatedInputType.inputType).pipe(take(1)).subscribe(type => {
      inputTypeSettings = type;
    });
    const wrappers = InputFieldHelper.setWrappers(calculatedInputType, settingsTranslated, inputTypeSettings);
    const isLastInGroup = false; // calculated later in calculateFieldPositionInGroup

    if (isEmptyInputType) {
      fieldConfig = {
        isParentGroup, // empty specific
        fieldGroup: [], // empty specific
        settings: settingsTranslated,
        fullSettings,
        wrappers,
        isExternal: calculatedInputType.isExternal,
        disableI18n,
        isLastInGroup,
        name,
        label,
        inputType: calculatedInputType.inputType,
        settings$: new BehaviorSubject(settingsTranslated),
      } as FieldConfigGroup;
    } else {
      const validationList: ValidatorFn[] = ValidationHelper.getValidations(settingsTranslated);
      const required: boolean = ValidationHelper.isRequired(settingsTranslated);
      let initialValue = LocalizationHelper.translate(
        currentLanguage,
        defaultLanguage,
        item.entity.attributes[name],
        null,
      );
      // set default value if needed
      if (isEmpty(initialValue) && typeof initialValue !== typeof true && typeof initialValue !== typeof 1 && initialValue !== '') {
        let languages: Language[] = [];
        languageService.entities$.pipe(take(1)).subscribe(langs => {
          languages = langs;
        });
        initialValue = itemService.setDefaultValue(
          item, attribute, calculatedInputType.inputType, settingsTranslated, languages, currentLanguage, defaultLanguage,
        );
      }
      const disabled = settingsTranslated.Disabled;

      fieldConfig = {
        initialValue, // other fields specific
        validation: validationList, // other fields specific
        settings: settingsTranslated,
        fullSettings,
        wrappers,
        focused$: new BehaviorSubject(false),
        isExternal: calculatedInputType.isExternal,
        disableI18n,
        isLastInGroup,
        name,
        index, // other fields specific
        label,
        placeholder: `Enter ${name}`,  // other fields specific
        inputType: calculatedInputType.inputType,
        type: attribute.type, // other fields specific
        required, // other fields specific
        disabled, // other fields specific
        settings$: new BehaviorSubject(settingsTranslated),
      };
    }
    return fieldConfig;
  }

  /** Translate field configuration (labels, validation, ...) */
  public translateSettingsAndValidation(
    config: FieldConfigSet,
    currentLanguage: string,
    defaultLanguage: string,
    formulaSettings?: FormulaFieldSettings,
  ): void {
    const fieldSettings = LocalizationHelper.translateSettings(config.field.fullSettings, currentLanguage, defaultLanguage);
    if (formulaSettings?.hidden) {
      fieldSettings.VisibleInEditUI = false;
    }
    if (formulaSettings?.required) {
      fieldSettings.Required = true;
    }
    if (formulaSettings?.disabled) {
      fieldSettings.Disabled = true;
    }
    config.field.settings = fieldSettings;
    config.field.label = config.field.settings.Name || null;
    config.field.validation = ValidationHelper.getValidations(config.field.settings);
    config.field.required = ValidationHelper.isRequired(config.field.settings);
    config.field.settings$.next(fieldSettings); // must run after validations are recalculated
  }

  /** Translate group (empty field) settings and validation */
  public translateGroupSettingsAndValidation(fieldConfig: FieldConfigGroup, currentLanguage: string, defaultLanguage: string): void {
    const fieldSettings = LocalizationHelper.translateSettings(fieldConfig.fullSettings, currentLanguage, defaultLanguage);
    fieldConfig.settings = fieldSettings;
    fieldConfig.label = fieldConfig.settings.Name || null;
    fieldConfig.validation = ValidationHelper.getValidations(fieldConfig.settings);
    fieldConfig.required = ValidationHelper.isRequired(fieldConfig.settings);
    fieldConfig.settings$.next(fieldSettings); // must run after validations are recalculated
  }
}
