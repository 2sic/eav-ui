import { LocalizationHelpers } from '.';
import { FieldSettings } from '../../../../../../edit-types';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { ItemIdentifierEditConfig } from '../../../shared/models/edit-form.model';
import { EmptyFieldHelpers } from '../../form/fields/empty/empty-field-helpers';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { TranslateMenuHelpers } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.helpers';
import { TranslationStateCore } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.models';
import { MetadataDecorators, TranslationLink, TranslationLinks } from '../constants';
import { ContentTypeSettings, TranslationState } from '../models';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavValues } from '../models/eav';
import { FormLanguage } from '../models/form-languages.model';

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
    attributeValues: EavValues<any>,
    defaultLanguage: string,
    attributeMetadata: EavEntity[],
  ): boolean {
    // disable translation if LanguagesDecorator in ContentType is false in any language
    const languagesDecorator = contentTypeMetadata.find(m => m.Type.Name === MetadataDecorators.LanguagesDecorator);
    if (languagesDecorator?.Attributes.Enabled?.Values.some(eavValue => eavValue.Value === false)) { return true; }

    if (inputType?.DisableI18n) { return true; }
    if (!LocalizationHelpers.translationExistsInDefault(attributeValues, defaultLanguage)) { return true; }

    // disable translation if DisableTranslation is true in any language in @All, @String, @string-default, etc...
    for (const metadataItem of attributeMetadata ?? []) {
      if (metadataItem.Attributes.DisableTranslation?.Values.some(eavValue => eavValue.Value === true)) { return true; }
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
    if (contentType.Attributes[index + 1] == null) { return true; }

    const indexOfFirstEmpty = contentType.Attributes.findIndex(a => EmptyFieldHelpers.isGroupStart(a.InputType));
    if (index < indexOfFirstEmpty) { return false; }

    // if (attribute.InputType === InputTypeConstants.EmptyEnd) { return true; }
    if (EmptyFieldHelpers.isGroupEnd(attribute.InputType)) return true;

    if (EmptyFieldHelpers.endsPreviousGroup(contentType.Attributes[index + 1].InputType)) return true;

    return false;
  }

  static getDisabledBecauseTranslations(
    attributeValues: EavValues<any>,
    disableTranslation: boolean,
    language: FormLanguage,
  ): boolean {
    if (language.current === language.primary) return false;
    if (!LocalizationHelpers.translationExistsInDefault(attributeValues, language.primary)) return true;
    if (disableTranslation) return true;
    if (LocalizationHelpers.hasEditableTranslation(attributeValues, language)) return false;
    if (LocalizationHelpers.hasReadonlyTranslation(attributeValues, language.current)) return true;
    return true;
  }

  static getTranslationState(
    attributeValues: EavValues<any>,
    disableTranslation: boolean,
    language: FormLanguage,
  ): TranslationState {
    let infoLabel: string;
    let infoMessage: string;

    if (disableTranslation) {
      infoLabel = 'LangMenu.InAllLanguages';
      infoMessage = '';
    } else if (!LocalizationHelpers.translationExistsInDefault(attributeValues, language.primary)) {
      infoLabel = 'LangMenu.MissingDefaultLangValue';
      infoMessage = language.primary;
    } else {
      const editableTranslationExists = LocalizationHelpers.hasEditableTranslation(attributeValues, language);
      const readonlyTranslationExists = LocalizationHelpers.hasReadonlyTranslation(attributeValues, language.current);

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
    attributeValues: EavValues<any>,
    disableTranslation: boolean,
    language: FormLanguage,
  ): TranslationStateCore {
    let langResult: string;
    let linkType: TranslationLink;

    // Determine is control disabled or enabled and info message
    if (!LocalizationHelpers.translationExistsInDefault(attributeValues, language.primary)) {
      langResult = '';
      linkType = TranslationLinks.MissingDefaultLangValue;
    } else if (disableTranslation) {
      langResult = '';
      linkType = TranslationLinks.DontTranslate;
    } else if (LocalizationHelpers.hasEditableTranslation(attributeValues, language)) {
      const editableElements = LocalizationHelpers.getValueTranslation(attributeValues, language)
        .Dimensions.filter(dimension => dimension.Value !== language.current);

      if (editableElements.length > 0) {
        langResult = editableElements[0].Value;
        linkType = TranslationLinks.LinkReadWrite;
      } else {
        langResult = '';
        linkType = TranslationLinks.Translate;
      }
    } else if (LocalizationHelpers.hasReadonlyTranslation(attributeValues, language.current)) {
      const readOnlyElements = LocalizationHelpers.getValueTranslation(attributeValues, language)
        .Dimensions.filter(dimension => dimension.Value !== language.current);

      langResult = readOnlyElements[0].Value;
      linkType = TranslationLinks.LinkReadOnly;
    } else {
      langResult = '';
      linkType = TranslationLinks.DontTranslate;
    }

    const translationState: TranslationStateCore = {
      language: langResult,
      linkType,
    };
    return translationState;
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
