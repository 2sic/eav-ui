import { Injectable, signal } from '@angular/core';
import { EavContentType, EavItem } from '../../models/eav';
import { EavContentTypeDto } from '../../models/json-format-v1';
import { ItemHelper } from '../../helpers/item.helper';
import { SignalStoreBase } from '../signal-store-base';

const logThis = false;
const nameOfThis = 'ContentTypeService';

@Injectable({ providedIn: 'root' })
export class ContentTypeService extends SignalStoreBase<string, EavContentType> {

  constructor() {
    super({ nameOfThis, logThis });
  }
  
  override getId = (item: EavContentType) => item.Id;

  addContentTypes(contentTypes: EavContentTypeDto[]): void {
    const converted = EavContentType.convertMany(contentTypes);
    this.addMany(converted);
  }

  getContentTypeOfItem(item: EavItem): EavContentType {
    const nameId = ItemHelper.getContentTypeNameId(item);
    return this.get(nameId);
  }

}
