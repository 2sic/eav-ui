import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { EavEntity } from '../../models/eav';
import { EavEntityDto } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class ContentTypeItemService extends BaseDataService<EavEntity> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentTypeItem', serviceElementsFactory);
  }

  addContentTypeItems(contentTypeItems1: EavEntityDto[]): void {
    const contentTypeItems = EavEntity.convertMany(contentTypeItems1);
    this.upsertManyInCache(contentTypeItems);
  }

  getContentTypeItem(guid: string): EavEntity {
    return this.cache().find(contentTypeItem => contentTypeItem.Guid === guid);
  }

  getContentTypeItems(guids: string[]): EavEntity[] {
    return this.cache().filter(contentTypeItem => guids.includes(contentTypeItem.Guid));
  }
}
