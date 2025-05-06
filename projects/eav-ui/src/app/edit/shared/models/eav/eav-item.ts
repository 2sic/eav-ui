import { EavEntity } from '.';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavEntityBundleDto } from '../json-format-v1';

export class EavItem {
  Entity: EavEntity;
  Header: ItemIdentifierHeader;

  static convert(entityBundleDto: EavEntityBundleDto): EavItem {
    const entity = EavEntity.dtoToEav(entityBundleDto.Entity);

    const item: EavItem = {
      Entity: entity,
      Header: entityBundleDto.Header,
    };
    return item;
  }
}
