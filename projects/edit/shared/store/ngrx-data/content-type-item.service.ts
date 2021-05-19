import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { EavEntity } from '../../models/eav';
import { Entity1 } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class ContentTypeItemService extends BaseDataService<EavEntity> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentTypeItem', serviceElementsFactory);
  }

  addContentTypeItems(contentTypeItems1: Entity1[]): void {
    const contentTypeItems = EavEntity.convertMany(contentTypeItems1);
    this.upsertManyInCache(contentTypeItems);
  }

  getContentTypeItem(guid: string): EavEntity {
    return this.cache$.value.find(contentTypeItem => contentTypeItem.Guid === guid);
  }

  getContentTypeItems(guids: string[]): EavEntity[] {
    return this.cache$.value.filter(contentTypeItem => guids.includes(contentTypeItem.Guid));
  }
}
