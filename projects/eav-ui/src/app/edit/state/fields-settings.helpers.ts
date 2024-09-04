import { EntityReader } from '../shared/helpers';
import { FieldSettings } from '../../../../../edit-types';
import { InputTypeMetadata } from '../../shared/fields/input-type-metadata.model';
import { ItemIdentifierEditConfig } from '../../shared/models/edit-form.model';
import { FieldLogicManager } from '../fields/logic/field-logic-manager';
import { TranslateMenuHelpers } from '../fields/wrappers/localization/translate-menu/translate-menu.helpers';
import { TranslationStateCore } from './translate-state.model';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavField } from '../shared/models/eav';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';
import { TranslationLinks } from '../localization/translation-link.constants';
import { LocalizationHelpers } from '../localization/localization.helpers';
import { MetadataDecorators } from './metadata-decorators.constants';
import { ContentTypeSettings } from './content-type-settings.model';
import { TranslationState } from './translate-state.model';
import { FormLanguage } from './form-languages.model';

export class ContentTypeSettingsHelpers {

  /**
   * Initialize the default settings of a ContentType to ensure everything is set or empty-string etc.
   * @returns 
   */
  static getDefaultSettings(reader: EntityReader, contentType: EavContentType, itemHeader: ItemIdentifierEditConfig): ContentTypeSettings {
    const metadata = reader.flattenAll<ContentTypeSettings>(contentType.Metadata);
    const defaultSettings = { ...metadata };
    defaultSettings.Description ??= '';
    defaultSettings.EditInstructions ??= '';
    defaultSettings.Features ??= '';
    defaultSettings.Label ??= '';
    defaultSettings.ListInstructions ??= '';
    defaultSettings.Notes ??= '';
    defaultSettings.Icon ??= '';
    defaultSettings.Link ??= '';
    defaultSettings._itemTitle = this.getTitle(contentType, reader);
    defaultSettings._slotCanBeEmpty = itemHeader.IsEmptyAllowed ?? false;
    defaultSettings._slotIsEmpty = itemHeader.IsEmpty ?? false;
    return defaultSettings;
  }

  static getTitle(contentType: EavContentType, language: FormLanguage): string {
    try {
      // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
      const type = contentType.Metadata.find(metadata => metadata.Type.Name === 'ContentType' || metadata.Type.Name === 'xx ContentType');
      let label = (type)
        ? LocalizationHelpers.getValueOrDefault(type.Attributes.Label, language)?.Value
        : null;
      label = label || contentType.Name;
      return label;
    } catch (error) {
      return contentType.Name;
    }
  }

}

export class FieldsSettingsHelpers {

  static getDefaultSettings(settings: FieldSettings): FieldSettings {
    const defSettings = AllDeprecated.moveDeprecatedSettings({ ...settings });
    // update @All settings
    defSettings.Name ??= '';
    defSettings.Placeholder ??= '';
    defSettings.Notes ??= '';
    defSettings.Required ??= false;
    defSettings.Disabled ??= false;
    defSettings.DisableTranslation ??= false;
    defSettings.Visible ??= true;
    if (defSettings.DefaultCollapsed != null) {
      defSettings.Collapsed = defSettings.DefaultCollapsed;
      delete defSettings.DefaultCollapsed;
    }
    defSettings.Formulas ??= [];
    let logic = FieldLogicManager.singleton().get(settings.InputType);
    defSettings.DisableAutoTranslation ??= !logic?.canAutoTranslate;
    return defSettings;
  }

  /** Find if DisableTranslation is true in any setting and in any language */
  static findDisableTranslation(
    contentTypeMetadata: EavEntity[],
    inputType: InputTypeMetadata,
    attributeValues: EavField<any>,
    defaultLanguage: string,
    attributeMetadata: EavEntity[],
  ): boolean {
    // disable translation if LanguagesDecorator in ContentType is false in any language
    const langDecorator = contentTypeMetadata.find(m => m.Type.Name === MetadataDecorators.LanguagesDecorator);
    if (langDecorator?.Attributes.Enabled?.Values.some(eavValue => eavValue.Value === false))
      return true;

    if (inputType?.DisableI18n)
      return true;

    if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, defaultLanguage))
      return true;

    // disable translation if DisableTranslation is true in any language in @All, @String, @string-default, etc...
    for (const mdItem of attributeMetadata ?? []) {
      if (mdItem.Attributes.DisableTranslation?.Values.some(eavValue => eavValue.Value === true))
        return true;
    }

    return false;
  }

  static isLastInGroup(contentType: EavContentType, attribute: EavContentTypeAttribute): boolean {
    const index = contentType.Attributes.indexOf(attribute);
    if (contentType.Attributes[index + 1] == null) return true;

    const indexOfFirstEmpty = contentType.Attributes.findIndex(a => InputTypeHelpers.isGroupStart(a.InputType));
    if (index < indexOfFirstEmpty) return false;

    if (InputTypeHelpers.isGroupEnd(attribute.InputType)) return true;

    if (InputTypeHelpers.endsPreviousGroup(contentType.Attributes[index + 1].InputType)) return true;

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

  static getTranslationState(attributeValues: EavField<any>, disableTranslation: boolean, language: FormLanguage): TranslationState {
    let infoLabel: string;
    let infoMessage: string;

    if (disableTranslation) {
      infoLabel = 'LangMenu.InAllLanguages';
      infoMessage = '';
    } else if (!LocalizationHelpers.hasValueOnPrimary(attributeValues, language.primary)) {
      infoLabel = 'LangMenu.MissingDefaultLangValue';
      infoMessage = language.primary;
    } else {
      const hasEditable = LocalizationHelpers.hasEditableValue(attributeValues, language);
      const hasReadonly = LocalizationHelpers.hasReadonlyValue(attributeValues, language.current);

      if (hasEditable || hasReadonly) {
        const dimensions = LocalizationHelpers.getValueTranslation(attributeValues, language)
          .Dimensions.map(dimension => dimension.Value)
          .filter(dimension => !dimension.includes(language.current));

        const isShared = dimensions.length > 0;
        if (isShared) {
          if (hasEditable)
            infoLabel = 'LangMenu.In';
          else if (hasReadonly)
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
    const state = this.#getTranslationStateCore(attributeValues, disableTranslation, language);
    const translationState: TranslationState = {
      infoLabel,
      infoMessage,
      language: state.language,
      linkType: state.linkType,
    };
    return translationState;
  }

  static #getTranslationStateCore(
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
