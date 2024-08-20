import { EavEntity } from '.';
import { EavEntityBundleDto } from '../json-format-v1';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';

export class EavItem {
  Entity: EavEntity;
  Header: ItemIdentifierHeader;

  static convert(entityBundleDto: EavEntityBundleDto): EavItem {
    const entity = EavEntity.convertOne(entityBundleDto.Entity);

    const item: EavItem = {
      Entity: entity,
      Header: entityBundleDto.Header,
    };
    return item;
  }
}
