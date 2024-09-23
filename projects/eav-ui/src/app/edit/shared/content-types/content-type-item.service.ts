import { Injectable } from '@angular/core';
import { EavEntity } from '../models/eav';
import { EavEntityDto } from '../models/json-format-v1';
import { SignalStoreBase } from '../store/signal-store-base';
import { classLog } from '../../../shared/logging/logging';

/**
 * Content-Type Items are additional entities which the ContentType info needs.
 * For example, external formulas.
 * 
 * This service stores / retrieves these.
 */
@Injectable({ providedIn: 'root' })
export class ContentTypeItemService extends SignalStoreBase<string, EavEntity> {

  constructor() {
    super(classLog({ContentTypeItemService}));
  }

  override getId = (item: EavEntity) => item.Guid;

  addContentTypeItems(contentTypeItems: EavEntityDto[]): void {
    const converted = EavEntity.convertMany(contentTypeItems);
    this.addMany(converted);
  }

}
