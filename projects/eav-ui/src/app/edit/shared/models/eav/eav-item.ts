import { EavEntity, EavEntityAttributes, EavFieldValue, EavType } from '.';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavEntityBundleDto } from '../json-format-v1';

export class EavItem {
  Entity: EavEntity;
  Header: ItemIdentifierHeader;

  static anyToEav(entityBundleDto: EavEntityBundleDto): EavItem {
    const override = entityBundleDto.Header.ClientData?.overrideContents;
    return override
      ? EavItem.objToEav(override, entityBundleDto.Header)
      : EavItem.dtoToEav(entityBundleDto);
  }

  static dtoToEav(entityBundleDto: EavEntityBundleDto): EavItem {
    const entity = EavEntity.dtoToEav(entityBundleDto.Entity);

    const item: EavItem = {
      Entity: entity,
      Header: entityBundleDto.Header,
    };

    console.log('2dg to EAV dto ', item);

    return item;
  }

  // TODO: @2dg - this is where the data will be converted
  static objToEav(override: Record<string, unknown>, header: ItemIdentifierHeader ): EavItem /*EavItem*/ {
    const attributes: EavEntityAttributes = {};
    for (const key in override) {
      // console.log('2dg key', key, 'value', override[key]);

      const type = this.getType(override[key]);

      attributes[key] = {
        Values: this.createEavFieldValue(override[key], type),
        Type: type,
      };

    }

    console.log('2dg attributes', attributes);

    const entity: EavEntity = {
      Attributes: attributes,
      Guid: 'generated-guid',
      Id: 0,
      Owner: 'system',
      Type: this.getEavType('Default'), // ?? 
      Version: 1,
      Metadata: [],
      For: null,
    };

    const item: EavItem = {
      Entity: entity,
      Header: header,
    };

    console.log('2dg to EAV obj', item);

    return item;
  }

  static getType(value: unknown): string {
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return 'Number';
    if (typeof value === 'boolean') return 'Boolean';
    return 'Unknown';
  }

  static createEavFieldValue(value: unknown, type: string): EavFieldValue<any>[] {
    const eavFieldValue: EavFieldValue<any> = {
      value: value,
      dimensions: null,
    };

    return [eavFieldValue];
  }


  static getEavType(name: string): EavType {
    return {
      Description: `${name} description`,
      Id: `${name}-id`,
      Name: name,
      Title: `${name} title`,
    };
  }

}
