import { LocalizationHelpers } from '.';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { TranslateMenuHelpers } from '../../eav-material-controls/localization/translate-menu/translate-menu.helpers';
import { TranslationStateCore } from '../../eav-material-controls/localization/translate-menu/translate-menu.models';
import { TranslationLinkConstants } from '../constants';
import { TranslationState } from '../models';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavValues } from '../models/eav';

export class FieldsSettingsHelpers {

  static mergeSettings<T>(metadataItems: EavEntity[], currentLanguage: string, defaultLanguage: string): T {
    if (metadataItems == null) { return {} as T; }

    const merged: Dictionary<any> = {};
    // copy metadata settings which are not @All
    for (const item of metadataItems) {
      if (item.Type.Id === '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelpers.translate(currentLanguage, defaultLanguage, values, null);
        merged[name] = value;
      }
    }

    // copy @All metadata settings, overwriting previous settings
    for (const item of metadataItems) {
      if (item.Type.Id !== '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelpers.translate(currentLanguage, defaultLanguage, values, null);
        // do not overwrite previous settings if @All is empty
        const exists = merged[name] != null;
        const emptyAll = value == null || value === '';
        if (exists && emptyAll) { continue; }

        merged[name] = value;
      }
    }

    return merged as T;
  }

  /** Find if DisableTranslation is true in any setting and in any language */
  static findDisableTranslation(
    inputType: InputType,
    attributeValues: EavValues<any>,
    defaultLanguage: string,
    metadataItems: EavEntity[],
  ): boolean {
    if (inputType?.DisableI18n) { return true; }
    if (!LocalizationHelpers.translationExistsInDefault(attributeValues, defaultLanguage)) { return true; }
    if (metadataItems == null) { return false; }

    // find DisableTranslation in @All, @String, @string-default, etc...
    for (const item of metadataItems) {
      const eavValues = item.Attributes['DisableTranslation'];
      if (eavValues == null) { continue; }

      // if true in any language, it is true for all cases
      for (const eavValue of eavValues.Values) {
        if (eavValue.Value === true) {
          return true;
        }
      }
    }

    return false;
  }

  static getContentTypeTitle(contentType: EavContentType, currentLanguage: string, defaultLanguage: string): string {
    let label: string;
    try {
      // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
      const type = contentType.Metadata.find(metadata => metadata.Type.Name === 'ContentType' || metadata.Type.Name === 'xx ContentType');
      if (type) {
        label = LocalizationHelpers.getValueOrDefault(type.Attributes.Label, currentLanguage, defaultLanguage)?.Value;
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

    const indexOfFirstEmpty = contentType.Attributes.findIndex(a => a.InputType === InputTypeConstants.EmptyDefault);
    if (index < indexOfFirstEmpty) { return false; }

    const isNotEmpty = attribute.InputType !== InputTypeConstants.EmptyDefault;
    const nextIsEmpty = contentType.Attributes[index + 1].InputType === InputTypeConstants.EmptyDefault;
    if (isNotEmpty && nextIsEmpty) { return true; }

    return false;
  }

  static getDisabledBecauseTranslations(
    attributeValues: EavValues<any>,
    disableTranslation: boolean,
    currentLanguage: string,
    defaultLanguage: string,
  ): boolean {
    if (currentLanguage === defaultLanguage) { return false; }
    if (!LocalizationHelpers.translationExistsInDefault(attributeValues, defaultLanguage)) { return true; }
    if (disableTranslation) { return true; }
    if (LocalizationHelpers.isEditableTranslationExist(attributeValues, currentLanguage, defaultLanguage)) { return false; }
    if (LocalizationHelpers.isReadonlyTranslationExist(attributeValues, currentLanguage)) { return true; }
    return true;
  }

  static getTranslationState(
    attributeValues: EavValues<any>,
    disableTranslation: boolean,
    currentLanguage: string,
    defaultLanguage: string,
  ): TranslationState {
    let infoLabel: string;
    let infoMessage: string;

    if (disableTranslation) {
      infoLabel = 'LangMenu.InAllLanguages';
      infoMessage = '';
    } else if (!LocalizationHelpers.translationExistsInDefault(attributeValues, defaultLanguage)) {
      infoLabel = 'LangMenu.MissingDefaultLangValue';
      infoMessage = defaultLanguage;
    } else {
      const editableTranslationExists = LocalizationHelpers.isEditableTranslationExist(attributeValues, currentLanguage, defaultLanguage);
      const readonlyTranslationExists = LocalizationHelpers.isReadonlyTranslationExist(attributeValues, currentLanguage);

      if (editableTranslationExists || readonlyTranslationExists) {
        const dimensions = LocalizationHelpers.getValueTranslation(attributeValues, currentLanguage, defaultLanguage)
          .Dimensions.map(dimension => dimension.Value)
          .filter(dimension => !dimension.includes(currentLanguage));

        const isShared = dimensions.length > 0;
        if (isShared) {
          if (editableTranslationExists) {
            infoLabel = 'LangMenu.In';
          } else if (readonlyTranslationExists) {
            infoLabel = 'LangMenu.From';
          }
          infoMessage = TranslateMenuHelpers.calculateSharedInfoMessage(dimensions, currentLanguage);
        } else {
          infoLabel = '';
          infoMessage = '';
        }
      } else {
        infoLabel = 'LangMenu.UseDefault';
        infoMessage = '';
      }
    }
    const state = this.getTranslationStateCore(attributeValues, disableTranslation, currentLanguage, defaultLanguage);
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
    currentLanguage: string,
    defaultLanguage: string,
  ): TranslationStateCore {
    let language: string;
    let linkType: string;

    // Determine is control disabled or enabled and info message
    if (!LocalizationHelpers.translationExistsInDefault(attributeValues, defaultLanguage)) {
      language = '';
      linkType = TranslationLinkConstants.MissingDefaultLangValue;
    } else if (disableTranslation) {
      language = '';
      linkType = TranslationLinkConstants.DontTranslate;
    } else if (LocalizationHelpers.isEditableTranslationExist(attributeValues, currentLanguage, defaultLanguage)) {
      const editableElements = LocalizationHelpers.getValueTranslation(attributeValues, currentLanguage, defaultLanguage)
        .Dimensions.filter(dimension => dimension.Value !== currentLanguage);

      if (editableElements.length > 0) {
        language = editableElements[0].Value;
        linkType = TranslationLinkConstants.LinkReadWrite;
      } else {
        language = '';
        linkType = TranslationLinkConstants.Translate;
      }
    } else if (LocalizationHelpers.isReadonlyTranslationExist(attributeValues, currentLanguage)) {
      const readOnlyElements = LocalizationHelpers.getValueTranslation(attributeValues, currentLanguage, defaultLanguage)
        .Dimensions.filter(dimension => dimension.Value !== currentLanguage);

      language = readOnlyElements[0].Value;
      linkType = TranslationLinkConstants.LinkReadOnly;
    } else {
      language = '';
      linkType = TranslationLinkConstants.DontTranslate;
    }

    const translationState: TranslationStateCore = {
      language,
      linkType,
    };
    return translationState;
  }
}
