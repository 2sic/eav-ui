import { ItemAddIdentifier } from '../../../shared/models/edit-form.model';
import { EavItem } from '../models/eav';

export class ItemHelper {
  static getContentTypeNameId(item: EavItem): string {
    return item.Entity.Type?.Id
      ?? (item.Header as ItemAddIdentifier).ContentTypeName;
  }
}