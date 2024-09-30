import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';
import { classLog } from '../../shared/logging';
import { DebugFields } from '../edit-debug';
import { FieldLogicManager } from '../fields/logic/field-logic-manager';
import { TranslateMenuHelpers } from '../fields/wrappers/localization/translate-menu/translate-menu.helpers';
import { FormLanguage } from '../form/form-languages.model';
import { FieldReader } from '../localization/field-reader';
import { TranslationState, TranslationStateCore } from '../localization/translate-state.model';
import { TranslationLinks } from '../localization/translation-link.constants';
import { EavContentType, EavContentTypeAttribute, EavField } from '../shared/models/eav';

const logSpecs = {
  all: false,
  mergeGenericSettings: true,
  getDefaultSettings: false,
  fields: [...DebugFields, 'GroupPreview'],
};

/**
 * Helper to figure out / initialize field settings.
 * 
 * It is, and must be, stateless.
 */
export class FieldsSettingsHelpers {

  // TODO: conditionally create logger based on source name
  log = classLog({FieldsSettingsHelpers}, logSpecs, true);

  constructor(source: string) { }

  /**
   * Special feature in 18.02
   * Generic settings are metadata which contain a JSON to basically set anything for which there is no Content-Type metadata.
   * @param settings 
   * @param genericSettings 
   */
  mergeGenericSettings(fieldName: string, settings: FieldSettings): FieldSettings {
    const l = this.log.fnIfInList('mergeGenericSettings', 'fields', fieldName, { fieldName, settings });
    const asWithGenericSettings = settings as unknown as { SettingsGeneric: string };
    if (asWithGenericSettings.SettingsGeneric == null)
      return l.r(settings, 'No generic settings');

    try {
      const genericSettings = JSON.parse(asWithGenericSettings.SettingsGeneric);
      return l.r({ ...settings, ...genericSettings }, 'Merged generic settings');
    } catch (error) {
      console.error('mergeGenericSettings', error);
      return l.r(settings, 'Error parsing generic settings');
    }
  }

  getDefaultSettings(settings: FieldSettings): FieldSettings {
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

  isLastInGroup(contentType: EavContentType, attribute: EavContentTypeAttribute): boolean {
    const index = contentType.Attributes.indexOf(attribute);
    if (contentType.Attributes[index + 1] == null) return true;

    const indexOfFirstEmpty = contentType.Attributes.findIndex(a => InputTypeHelpers.isGroupStart(a.InputType));
    if (index < indexOfFirstEmpty) return false;

    if (InputTypeHelpers.isGroupEnd(attribute.InputType)) return true;

    if (InputTypeHelpers.endsPreviousGroup(contentType.Attributes[index + 1].InputType)) return true;

    return false;
  }

  getDisabledBecauseTranslations(
    attributeValues: EavField<any>,
    disableTranslation: boolean,
    language: FormLanguage
  ): boolean {
    const fieldReader = new FieldReader(attributeValues, language);
    if (language.current === language.primary) return false;
    if (!fieldReader.hasPrimary) return true;
    if (disableTranslation) return true;
    if (fieldReader.hasEditableValues) return false;
    if (fieldReader.hasCurrentReadonly) return true;
    return true;
  }

  getTranslationState(attributeValues: EavField<any>, disableTranslation: boolean, language: FormLanguage, debug: boolean): TranslationState {
    if (debug)
      this.log.fn('getTranslationState', { attributeValues, disableTranslation, language });

    let infoLabel: string;
    let infoMessage: string;

    const fieldReader = new FieldReader(attributeValues, language);

    if (disableTranslation) {
      infoLabel = 'LangMenu.InAllLanguages';
      infoMessage = '';
    } else if (!fieldReader.hasPrimary) {
      infoLabel = 'LangMenu.MissingDefaultLangValue';
      infoMessage = language.primary;
    } else {
      const hasEditable = fieldReader.hasEditableValues;
      const hasReadonly = fieldReader.hasCurrentReadonly;

      if (hasEditable || hasReadonly) {
        const dimensions = fieldReader.current
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

  #getTranslationStateCore(
    attributeValues: EavField<any>,
    disableTranslation: boolean,
    language: FormLanguage
  ): TranslationStateCore {
    const fieldReader = new FieldReader(attributeValues, language);
    // Determine is control disabled or enabled and info message
    if (!fieldReader.hasPrimary)
      return { language: '', linkType: TranslationLinks.MissingDefaultLangValue };

    if (disableTranslation)
      return { language: '', linkType: TranslationLinks.DontTranslate };

    if (fieldReader.hasEditableValues) {
      const editableElements = fieldReader.current
        .Dimensions.filter(d => d.Value !== language.current);

      return (editableElements.length > 0)
        ? { language: editableElements[0].Value, linkType: TranslationLinks.LinkReadWrite }
        : { language: '', linkType: TranslationLinks.Translate };
    }

    if (fieldReader.hasCurrentReadonly) {
      const readOnlyElements = fieldReader.current
        .Dimensions.filter(d => d.Value !== language.current);

      return { language: readOnlyElements[0].Value, linkType: TranslationLinks.LinkReadOnly, };
    }

    return { language: '', linkType: TranslationLinks.DontTranslate, };
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
