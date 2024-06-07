import { LanguageState } from '../../../shared/models/language-state';
import { EavEntity, EavValues } from '../models/eav';
import { LocalizationHelpers } from './localization.helpers';

export class EntityReader implements LanguageState {
  constructor(public current: string, public primary: string) {}

    // WIP - to make code clearer, this is what should be used from now on
  // But we'll probably end up calling this from the EntityReader only, so it should be straight forward
  getBestValue<T>(attributeValues: EavValues<unknown>, defaultValue: T): T {
    return LocalizationHelpers.translate(this.current, this.primary, attributeValues, defaultValue);
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
        const value = this.getBestValue(values, null);
        merged[name] = value;
      }
    }

    // copy @All metadata settings, overwriting previous settings
    for (const item of metadataItems) {
      if (item.Type.Id !== '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = this.getBestValue(values, null);
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
