import { EavEntity, EavEntityAttributes, EavFieldValue } from '.';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavEntityBundleDto } from '../json-format-v1';

export type EavTypeMap = {
  String: string;
  Number: number;
  Boolean: boolean;
  Object: Record<string, unknown>;
  Unknown: unknown;
};

export type EavTypeName = keyof EavTypeMap;

export class EavItem {
  Entity: EavEntity;
  Header: ItemIdentifierHeader;

  static anyToEav(entityBundleDto: EavEntityBundleDto): EavItem {

    const data = entityBundleDto.Header.ClientData?.data;
    if (data) {
      return this.#objToEav(data as Record<string, unknown>, entityBundleDto, 'from ClientData.data');
    }
    
    const override = entityBundleDto.Header.ClientData?.overrideContents;

    return override
      ? EavItem.#objToEav(override, entityBundleDto, 'from ClientData.overrideContents')
      : EavItem.dtoToEav(entityBundleDto);
  }

  static dtoToEav(entityBundleDto: EavEntityBundleDto): EavItem {
    const entity = EavEntity.dtoToEav(entityBundleDto.Entity);

    return {
      ...entityBundleDto,
      Entity: entity,
    } satisfies EavItem;
  }

  /**
 * Converts a raw override object and DTOs into a complete EavItem.
 */
  static #objToEav(
    override: Record<string, unknown>,
    entityBundleDto: EavEntityBundleDto,
    message: string,
  ): EavItem {

    console.log('2dm - EavItem - objToEav', { override, entityBundleDto, message });

    // Build attributes by converting each override key-value pair
    const attributes: EavEntityAttributes = Object.fromEntries(
      Object.entries(override).map(([key, value]) => {
        const type = this.getType(value);
        return [
          key,
          {
            Values: EavFieldValue.createEavFieldValue(
              value as EavTypeMap[EavTypeName],
            ),
            Type: type,
          },
        ];
      })
    );

    // Convert DTO to entity and assign new attributes
    const entity: EavEntity = {
      ...EavEntity.dtoToEav(entityBundleDto.Entity),
      Attributes: attributes,
    };

    // Combine entity and header into EavItem
    return {
      ...entityBundleDto,
      Entity: entity,
    } satisfies EavItem;
  }



  static eavToObj(eavItem: EavItem): Record<string, unknown> {
    const attributes = eavItem.Entity.Attributes;
    const result: Record<string, unknown> = {};

    for (const key in attributes) {
      const attr = attributes[key];
      if (!attr.Values || attr.Values.length === 0)
        continue;

      // to map to object, just take the first value
      result[key] = attr.Values[0].value;
    }

    return result;
  }


  /**
   * Determines the EAV data type based on the JS type of the value.
   */
  static getType(value: unknown): string {
    switch (typeof value) {
      case 'string':
        return 'String';
      case 'number':
        return 'Number';
      case 'boolean':
        return 'Boolean';
      default:
        return 'Unknown';
    }
  }





}
