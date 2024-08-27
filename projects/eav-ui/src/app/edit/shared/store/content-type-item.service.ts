import { Injectable } from '@angular/core';
import { EavEntity } from '../models/eav';
import { EavEntityDto } from '../models/json-format-v1';
import { SignalStoreBase } from './signal-store-base';

const logThis = false;
const nameOfThis = 'ContentTypeItemService';

/**
 * Content-Type Items are additional entities which the ContentType info needs.
 * For example, external formulas.
 * 
 * This service stores / retrieves these.
 */
@Injectable({ providedIn: 'root' })
export class ContentTypeItemService extends SignalStoreBase<string, EavEntity> {

  constructor() {
    super({ nameOfThis, logThis });
  }

  override getId = (item: EavEntity) => item.Guid;

  addContentTypeItems(contentTypeItems: EavEntityDto[]): void {
    const converted = EavEntity.convertMany(contentTypeItems);
    this.addMany(converted);
  }

}
