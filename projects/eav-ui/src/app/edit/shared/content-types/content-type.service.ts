import { Injectable } from '@angular/core';
import { classLog } from '../../../shared/logging';
import { ItemHelper } from '../helpers/item.helper';
import { EavContentType, EavContentTypeAttribute, EavItem } from '../models/eav';
import { EavContentTypeDto } from '../models/json-format-v1';
import { SignalStoreBase } from '../store/signal-store-base';

@Injectable({ providedIn: 'root' })
export class ContentTypeService extends SignalStoreBase<string, EavContentType> {

  constructor() {
    super(classLog({ContentTypeService}));
  }
  
  override getId = (item: EavContentType) => item.Id;

  addContentTypes(contentTypes: EavContentTypeDto[]): void {
    const converted = EavContentType.dtoToEavMany(contentTypes);
    this.addMany(converted);
  }

  getContentTypeOfItem(item: EavItem): EavContentType {
    const nameId = ItemHelper.getContentTypeNameId(item);
    return this.get(nameId);
  }

  getAttribute(guid: string, name: string): EavContentTypeAttribute {
    return this.get(guid).Attributes.find(a => a.Name === name);
  }

  getAttributeOfItem(item: EavItem, name: string): EavContentTypeAttribute {
    return this.getContentTypeOfItem(item).Attributes.find(a => a.Name === name);
  }
}
