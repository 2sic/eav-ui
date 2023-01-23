import { EavEntity } from '../models/eav';
import { LocalizationHelpers } from './localization.helpers';

export class EntityReader {
  constructor(public currentLanguage: string, public defaultLanguage: string) {
  }

  public flatten<T>(metadataItem: EavEntity): T {
    return this.flattenAll<T>([metadataItem]);
  }

  flattenAll<T>(metadataItems: EavEntity[]): T {
    if (metadataItems == null) { return {} as T; }

    const merged: Record<string, any> = {};
    // copy metadata settings which are not @All
    for (const item of metadataItems) {
      if (item.Type.Id === '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelpers.translate(this.currentLanguage, this.defaultLanguage, values, null);
        merged[name] = value;
      }
    }

    // copy @All metadata settings, overwriting previous settings
    for (const item of metadataItems) {
      if (item.Type.Id !== '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelpers.translate(this.currentLanguage, this.defaultLanguage, values, null);
        // do not overwrite previous settings if @All is empty
        const exists = merged[name] != null;
        const emptyAll = value == null || value === '';
        if (exists && emptyAll) { continue; }

        merged[name] = value;
      }
    }

    return merged as T;
  }

}
