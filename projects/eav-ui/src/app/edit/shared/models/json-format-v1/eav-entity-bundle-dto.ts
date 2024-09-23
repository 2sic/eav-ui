import { EavEntityDto } from '.';
import { EavItem } from '../eav';
import { ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';

/**
 * A bundle/set for an Entity.
 * Contains the Entity and the Header.
 * This is a DTO (Data Transfer Object).
 */
export class EavEntityBundleDto {
  Entity: EavEntityDto;
  Header: ItemIdentifierHeader;

  static bundleToDto(item: EavItem): EavEntityBundleDto {
    const entity1 = EavEntityDto.entityToDto(item.Entity);

    const bundleDto: EavEntityBundleDto = {
      Entity: entity1,
      Header: item.Header,
    };
    return bundleDto;
  }
}
