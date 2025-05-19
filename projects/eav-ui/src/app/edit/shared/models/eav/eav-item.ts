import { EavEntity, EavEntityAttributes, EavFieldValue } from '.';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavEntityBundleDto, EavEntityDto } from '../json-format-v1';

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
    const override = entityBundleDto.Header.ClientData?.overrideContents;

    return override
      ? EavItem.objToEav(override, entityBundleDto.Header, entityBundleDto.Entity)
      : EavItem.dtoToEav(entityBundleDto);
  }

  static dtoToEav(entityBundleDto: EavEntityBundleDto): EavItem {
    const entity = EavEntity.dtoToEav(entityBundleDto.Entity);

    const item: EavItem = {
      Entity: entity,
      Header: entityBundleDto.Header,
    };

    return item;
  }

  /**
 * Converts a raw override object and DTOs into a complete EavItem.
 */
  static objToEav(
    override: Record<string, unknown>,
    header: ItemIdentifierHeader,
    entityDto: EavEntityDto
  ): EavItem {
    const attributes: EavEntityAttributes = {};

    // Build attributes by converting each override key-value pair
    for (const key in override) {
      const value = override[key];
      const type = this.getType(value);

      attributes[key] = {
        Values: EavFieldValue.createEavFieldValue(
          value as EavTypeMap[EavTypeName], // TS braucht Hilfe hier
        ),
        Type: type,
      };
    }

    // Convert DTO to entity and assign new attributes
    const entity = EavEntity.dtoToEav(entityDto);
    entity.Attributes = attributes;

    // Combine entity and header into EavItem
    return {
      Entity: entity,
      Header: header,
    };
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
