import { LocalizationHelpers, ValidationHelpers } from '.';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { ItemIdentifierEditConfig } from '../../../shared/models/edit-form.model';
import { EmptyFieldHelpers } from '../../form/fields/empty/empty-field-helpers';
import { FieldLogicBase } from '../../form/shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../form/shared/field-logic/field-logic-tools';
import { TranslateMenuHelpers } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.helpers';
import { TranslationStateCore } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.models';
import { ConstantFieldParts } from '../../formulas/models/constant-field-parts.model';
import { MetadataDecorators, TranslationLinks } from '../constants';
import { ContentTypeSettings, TranslationState } from '../models';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavField } from '../models/eav';
import { FormLanguage } from '../models/form-languages.model';

/**
 * Special helper to check if a field should remain disabled because of various language settings.
 * 
 * Only used in formulas, after running formulas which modify settings.
 * 
 * Each one is specific to a certain field, so you must create another object for every field you check.
 */
export class FieldSettingsDisabledBecauseOfLanguageHelper {

  constructor(
    // General & Content Type Info
    private contentTypeMetadata: EavEntity[],
    private language: FormLanguage,
    /** set of configuration for running field logic - shared */
    private fieldLogicTools: FieldLogicTools,
    /** Info that the form is read-only */
    private formReadOnly: boolean,
    private formSlotIsEmpty: boolean,

    // Field specific info
    private attribute: EavContentTypeAttribute,
    private constantFieldPart: ConstantFieldParts,
    // private inputType: InputType,
    private attributeValues: EavField<any>,
  ) {

  }

  /**
   * Used for calculating new settings.
   * @param settingsInitial Default settings
   * @param settingsNew Last settings
   * @param attribute
   * @param contentTypeMetadata
   * @param fieldInputType
   * @param fieldLogic
   * @param attributeValues
   * @param language
   * @param slotIsEmpty If slot is empty
   * @param formReadOnly Is form read only
   * @param valueBefore
   * @param logicTools
   * @returns Calculated settings
   */
  ensureNewSettingsMatchRequirements(
    // settingsInitial: FieldSettings,
    settingsNew: FieldSettings,
    // attribute: EavContentTypeAttribute,
    // contentTypeMetadata: EavEntity[],
    // fieldInputType: InputType,
    // fieldLogic: FieldLogicBase,
    // attributeValues: EavField<any>,
    // language: FormLanguage,
    // slotIsEmpty: boolean,
    // formReadOnly: boolean,
    valueBefore: FieldValue,
    // logicTools: FieldLogicTools,
    // disabledHelper: FieldSettingsDisabledBecauseOfLanguageHelper,
  ): FieldSettings {
    const constantFieldPart = this.constantFieldPart;
    const slotIsEmpty = this.formSlotIsEmpty;
    settingsNew.Name = settingsNew.Name || this.attribute.Name;
    settingsNew._currentRequired = ValidationHelpers.isRequired(settingsNew);
    const disableTranslation = this.findDisableTranslation();
    //  FieldsSettingsHelpers.findDisableTranslation(
    //   contentTypeMetadata,
    //   fieldInputType,
    //   attributeValues,
    //   language.primary,
    //   attribute.Metadata,
    // );
    settingsNew.DisableTranslation = slotIsEmpty || disableTranslation;
    settingsNew._disabledBecauseOfTranslation = this.getDisabledBecauseTranslations(settingsNew.DisableTranslation);
    //  FieldsSettingsHelpers.getDisabledBecauseTranslations(
    //   attributeValues,
    //   settingsNew.DisableTranslation,
    //   language,
    // );
    settingsNew.ForcedDisabled = slotIsEmpty || settingsNew._disabledBecauseOfTranslation || this.formReadOnly;

    settingsNew.DisableAutoTranslation = constantFieldPart.settingsInitial.DisableAutoTranslation
      || settingsNew.DisableTranslation;

    // update settings with respective FieldLogics
    const fixed = constantFieldPart.logic?.update(settingsNew, valueBefore, this.fieldLogicTools) ?? settingsNew;

    return fixed;
  }


  /** Find if DisableTranslation is true in any setting and in any language */
  findDisableTranslation(): boolean {
    const contentTypeMetadata = this.contentTypeMetadata;
    const inputType = this.constantFieldPart.inputType;
    const attributeValues = this.attributeValues;
    const defaultLanguage = this.language.primary;
    const attributeMetadata = this.attribute.Metadata;

    // disable translation if LanguagesDecorator in ContentType is false in any language
    const languagesDecorator = contentTypeMetadata.find(m => m.Type.Name === MetadataDecorators.LanguagesDecorator);
    if (languagesDecorator?.Attributes.Enabled?.Values.some(eavValue => eavValue.Value === false))
      return true;

    if (inputType?.DisableI18n)
      return true;

    if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, defaultLanguage))
      return true;

    // disable translation if DisableTranslation is true in any language in @All, @String, @string-default, etc...
    for (const metadataItem of attributeMetadata ?? []) {
      if (metadataItem.Attributes.DisableTranslation?.Values.some(eavValue => eavValue.Value === true))
        return true;
    }

    return false;
  }

  getDisabledBecauseTranslations(disableTranslation: boolean): boolean {
    const attributeValues = this.attributeValues;
    const language = this.language;
    if (language.current === language.primary) return false;
    if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, language.primary)) return true;
    if (disableTranslation) return true;
    if (LocalizationHelpers.hasEditableValue(attributeValues, language)) return false;
    if (LocalizationHelpers.hasReadonlyValue(attributeValues, language.current)) return true;
    return true;
  }
}

export class FieldsSettingsHelpers {

  static setDefaultContentTypeSettings(
    settings: ContentTypeSettings,
    contentType: EavContentType,
    language: FormLanguage,
    itemHeader: ItemIdentifierEditConfig,
  ): ContentTypeSettings {
    const defaultSettings = { ...settings };
    defaultSettings.Description ??= '';
    defaultSettings.EditInstructions ??= '';
    defaultSettings.Features ??= '';
    defaultSettings.Label ??= '';
    defaultSettings.ListInstructions ??= '';
    defaultSettings.Notes ??= '';
    defaultSettings.Icon ??= '';
    defaultSettings.Link ??= '';
    defaultSettings._itemTitle = FieldsSettingsHelpers.getContentTypeTitle(contentType, language);
    defaultSettings._slotCanBeEmpty = itemHeader.IsEmptyAllowed ?? false;
    defaultSettings._slotIsEmpty = itemHeader.IsEmpty ?? false;
    return defaultSettings;
  }

  static setDefaultFieldSettings(settings: FieldSettings): FieldSettings {
    const defaultSettings = AllDeprecated.moveDeprecatedSettings({ ...settings });
    // update @All settings
    defaultSettings.Name ??= '';
    defaultSettings.Placeholder ??= '';
    defaultSettings.Notes ??= '';
    // defaultSettings.VisibleInEditUI ??= true;
    defaultSettings.Required ??= false;
    defaultSettings.Disabled ??= false;
    defaultSettings.DisableTranslation ??= false;
    defaultSettings.Visible ??= true; // defaultSettings.VisibleInEditUI;
    // delete defaultSettings.VisibleInEditUI;
    if (defaultSettings.DefaultCollapsed != null) {
      defaultSettings.Collapsed = defaultSettings.DefaultCollapsed;
      delete defaultSettings.DefaultCollapsed;
    }
    defaultSettings.Formulas ??= [];
    let logic = FieldLogicManager.singleton().get(settings.InputType);
    defaultSettings.DisableAutoTranslation ??= !logic?.canAutoTranslate;
    return defaultSettings;
  }

  /** Find if DisableTranslation is true in any setting and in any language */
  static findDisableTranslation(
    contentTypeMetadata: EavEntity[],
    inputType: InputType,
    attributeValues: EavField<any>,
    defaultLanguage: string,
    attributeMetadata: EavEntity[],
  ): boolean {
    // disable translation if LanguagesDecorator in ContentType is false in any language
    const languagesDecorator = contentTypeMetadata.find(m => m.Type.Name === MetadataDecorators.LanguagesDecorator);
    if (languagesDecorator?.Attributes.Enabled?.Values.some(eavValue => eavValue.Value === false))
      return true;

    if (inputType?.DisableI18n)
      return true;

    if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, defaultLanguage))
      return true;

    // disable translation if DisableTranslation is true in any language in @All, @String, @string-default, etc...
    for (const metadataItem of attributeMetadata ?? []) {
      if (metadataItem.Attributes.DisableTranslation?.Values.some(eavValue => eavValue.Value === true))
        return true;
    }

    return false;
  }

  static getContentTypeTitle(contentType: EavContentType, language: FormLanguage): string {
    let label: string;
    try {
      // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
      const type = contentType.Metadata.find(metadata => metadata.Type.Name === 'ContentType' || metadata.Type.Name === 'xx ContentType');
      if (type) {
        label = LocalizationHelpers.getValueOrDefault(type.Attributes.Label, language)?.Value;
      }
      label = label || contentType.Name;
    } catch (error) {
      label = contentType.Name;
    }
    return label;
  }

  static findIsLastInGroup(contentType: EavContentType, attribute: EavContentTypeAttribute): boolean {
    const index = contentType.Attributes.indexOf(attribute);
    if (contentType.Attributes[index + 1] == null) return true;

    const indexOfFirstEmpty = contentType.Attributes.findIndex(a => EmptyFieldHelpers.isGroupStart(a.InputType));
    if (index < indexOfFirstEmpty) return false;

    if (EmptyFieldHelpers.isGroupEnd(attribute.InputType)) return true;

    if (EmptyFieldHelpers.endsPreviousGroup(contentType.Attributes[index + 1].InputType)) return true;

    return false;
  }

  static getDisabledBecauseTranslations(
    attributeValues: EavField<any>,
    disableTranslation: boolean,
    language: FormLanguage,
  ): boolean {
    if (language.current === language.primary) return false;
    if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, language.primary)) return true;
    if (disableTranslation) return true;
    if (LocalizationHelpers.hasEditableValue(attributeValues, language)) return false;
    if (LocalizationHelpers.hasReadonlyValue(attributeValues, language.current)) return true;
    return true;
  }

  static getTranslationState(
    attributeValues: EavField<any>,
    disableTranslation: boolean,
    language: FormLanguage,
  ): TranslationState {
    let infoLabel: string;
    let infoMessage: string;

    if (disableTranslation) {
      infoLabel = 'LangMenu.InAllLanguages';
      infoMessage = '';
    } else if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, language.primary)) {
      infoLabel = 'LangMenu.MissingDefaultLangValue';
      infoMessage = language.primary;
    } else {
      const editableTranslationExists = LocalizationHelpers.hasEditableValue(attributeValues, language);
      const readonlyTranslationExists = LocalizationHelpers.hasReadonlyValue(attributeValues, language.current);

      if (editableTranslationExists || readonlyTranslationExists) {
        const dimensions = LocalizationHelpers.getValueTranslation(attributeValues, language)
          .Dimensions.map(dimension => dimension.Value)
          .filter(dimension => !dimension.includes(language.current));

        const isShared = dimensions.length > 0;
        if (isShared) {
          if (editableTranslationExists)
            infoLabel = 'LangMenu.In';
          else if (readonlyTranslationExists)
            infoLabel = 'LangMenu.From';

          infoMessage = TranslateMenuHelpers.calculateSharedInfoMessage(dimensions, language.current);
        } else {
          infoLabel = '';
          infoMessage = '';
        }
      } else {
        infoLabel = 'LangMenu.UseDefault';
        infoMessage = '';
      }
    }
    const state = this.getTranslationStateCore(attributeValues, disableTranslation, language);
    const translationState: TranslationState = {
      infoLabel,
      infoMessage,
      language: state.language,
      linkType: state.linkType,
    };
    return translationState;
  }

  private static getTranslationStateCore(
    attributeValues: EavField<any>,
    disableTranslation: boolean,
    language: FormLanguage,
  ): TranslationStateCore {
    // Determine is control disabled or enabled and info message
    if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, language.primary))
      return { language: '', linkType: TranslationLinks.MissingDefaultLangValue }

    if (disableTranslation)
      return { language: '', linkType: TranslationLinks.DontTranslate }

    if (LocalizationHelpers.hasEditableValue(attributeValues, language)) {
      const editableElements = LocalizationHelpers.getValueTranslation(attributeValues, language)
        .Dimensions.filter(dimension => dimension.Value !== language.current);

      return (editableElements.length > 0)
        ? { language: editableElements[0].Value, linkType: TranslationLinks.LinkReadWrite }
        : { language: '', linkType: TranslationLinks.Translate }
    }

    if (LocalizationHelpers.hasReadonlyValue(attributeValues, language.current)) {
      const readOnlyElements = LocalizationHelpers.getValueTranslation(attributeValues, language)
        .Dimensions.filter(dimension => dimension.Value !== language.current);

      return { language: readOnlyElements[0].Value, linkType: TranslationLinks.LinkReadOnly, }
    }

    return { language: '', linkType: TranslationLinks.DontTranslate, }
  }
}

class AllDeprecated {
  /** @deprecated */
  VisibleInEditUI: boolean;
  /** VisibleInEditUi is copied Visible and then deleted */
  static moveDeprecatedSettings(settings: FieldSettings): FieldSettings {
    var asDeprecated = settings as unknown as AllDeprecated;
    if (asDeprecated.VisibleInEditUI == null) return settings;
    settings.Visible = asDeprecated.VisibleInEditUI;
    delete asDeprecated.VisibleInEditUI;
    return settings;
  }
}
