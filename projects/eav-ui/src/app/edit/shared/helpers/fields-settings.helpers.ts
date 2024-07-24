import { LocalizationHelpers } from '.';
import { FieldSettings } from '../../../../../../edit-types';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { ItemIdentifierEditConfig } from '../../../shared/models/edit-form.model';
import { EmptyFieldHelpers } from '../../form/fields/empty/empty-field-helpers';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { TranslateMenuHelpers } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.helpers';
import { TranslationStateCore } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.models';
import { MetadataDecorators, TranslationLinks } from '../constants';
import { ContentTypeSettings, TranslationState } from '../models';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavField } from '../models/eav';
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
    attributeValues: EavField<any>,
    defaultLanguage: string,
    attributeMetadata: EavEntity[],
  ): boolean {
    // disable translation if LanguagesDecorator in ContentType is false in any language
    const languagesDecorator = contentTypeMetadata.find(m => m.Type.Name === MetadataDecorators.LanguagesDecorator);
    if (languagesDecorator?.Attributes.Enabled?.Values.some(eavValue => eavValue.Value === false)) return true;

    if (inputType?.DisableI18n) return true;
    if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, defaultLanguage)) return true;

    // disable translation if DisableTranslation is true in any language in @All, @String, @string-default, etc...
    for (const metadataItem of attributeMetadata ?? []) {
      if (metadataItem.Attributes.DisableTranslation?.Values.some(eavValue => eavValue.Value === true)) return true;
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

    // if (attribute.InputType === InputTypeConstants.EmptyEnd) return true;
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
