import { EavEntity } from '.';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavEntityBundleDto } from '../json-format-v1';

export class EavItem {
  Entity: EavEntity;
  Header: ItemIdentifierHeader;

  static anyToEav(entityBundleDto: EavEntityBundleDto): EavItem {
    const override = entityBundleDto.Header.ClientData?.overrideContents;
    return override
      ? EavItem.objToEav(override)
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

  // TODO: @2dg - this is where the data will be converted
  static objToEav(override: Record<string, unknown>): EavItem {
    throw new Error('Not implemented yet! @2dg');
  }
}
