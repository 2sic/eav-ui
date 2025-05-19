import { classLog } from '../../../shared/logging';
import { FormLanguage } from '../../form/form-languages.model';
import { FieldReader } from '../../localization/field-reader';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { EavEntity, EavEntityAttributes, EavField } from '../models/eav';

const logSpecs = {
  all: false,
  constructor: false,
};

export class EntityReader implements FormLanguage {
  
  log = classLog({EntityReader}, logSpecs);

  /** @inheritdoc */
  public current: string;
  /** @inheritdoc */
  public primary: string;

  constructor(formLanguage: FormLanguage);
  constructor(current: string, primary: string);
  constructor(current: FormLanguage | string, primary?: string) {
    this.log.fnIf('constructor', { current, primary });
    if (typeof current === 'string') {
      this.current = current;
      this.primary = primary;
    } else {
      this.current = current.current;
      this.primary = current.primary;
    }
  }

  // WIP - to make code clearer, this is what should be used from now on
  // But we'll probably end up calling this from the EntityReader only, so it should be straight forward
  getBestValue<T>(attributeValues: EavField<T>, defaultValue: T = null): T {
    const fieldReader = new FieldReader<T>(attributeValues, this);
    return fieldReader.currentOrDefaultOrAny?.value ?? defaultValue;
    // return LocalizationHelpers.translate<T>(this, attributeValues as EavField<T>, defaultValue);
  }

  public flatten<T>(metadata: EavEntity | EavEntity[]): T {
    if (metadata == null)
      return {} as T;

    const metadataItems = Array.isArray(metadata) ? metadata : [metadata];
    if (metadataItems.length === 0 || metadataItems[0] == null)
      return {} as T;

    const merged: Record<string, any> = {};
    // copy metadata settings which are not @All
    for (const item of metadataItems) {
      if (item.Type.Id === '@All') continue;

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = this.getBestValue(values);
        merged[name] = value;
      }
    }

    // copy @All metadata settings, overwriting previous settings
    for (const item of metadataItems) {
      if (item.Type.Id !== '@All') continue;

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = this.getBestValue(values);
        // do not overwrite previous settings if @All is empty
        const exists = merged[name] != null;
        const emptyAll = value == null || value === '';
        if (exists && emptyAll) continue;

        merged[name] = value;
      }
    }

    return merged as T;
  }

  currentValues(itemAttributes: EavEntityAttributes): ItemValuesOfLanguage {

    console.log('2dg InitialValues - currentValues', itemAttributes);

    const formValues: ItemValuesOfLanguage = Object.entries(itemAttributes)
      .reduce((acc, [name, values]) => {
        acc[name] = this.getBestValue(values);
        return acc;
      }, {} as ItemValuesOfLanguage);

       console.log('2dg InitialValues - currentValues formValues', formValues);

    return formValues;
  }

}
