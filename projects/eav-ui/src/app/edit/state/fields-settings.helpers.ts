import { ItemIdentifierEditConfig } from '../../shared/models/edit-form.model';
import { FormLanguage } from '../form/form-languages.model';
import { FieldReader } from '../localization/field-reader';
import { EntityReader } from '../shared/helpers';
import { EavContentType } from '../shared/models/eav';
import { ContentTypeSettings } from './content-type-settings.model';

export class ContentTypeSettingsHelpers {

  /**
   * Initialize the default settings of a ContentType to ensure everything is set or empty-string etc.
   * @returns 
   */
  static getDefaultSettings(reader: EntityReader, contentType: EavContentType, itemHeader: ItemIdentifierEditConfig): ContentTypeSettings {
    const metadata = reader.flatten<ContentTypeSettings>(contentType.Metadata);
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
        ? new FieldReader(type.Attributes.Label, language).currentOrDefault?.value
        : null;
      label = label || contentType.Name;
      return label;
    } catch (error) {
      return contentType.Name;
    }
  }

}


