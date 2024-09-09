import { EntityReader } from '../shared/helpers';
import { ItemIdentifierEditConfig } from '../../shared/models/edit-form.model';
import { EavContentType } from '../shared/models/eav';
import { LocalizationHelpers } from '../localization/localization.helpers';
import { ContentTypeSettings } from './content-type-settings.model';
import { FormLanguage } from '../form/form-languages.model';

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


