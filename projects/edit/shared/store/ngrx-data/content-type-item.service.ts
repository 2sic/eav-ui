import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map } from 'rxjs/operators';
import { EavEntity } from '../../models/eav';
import { Entity1 } from '../../models/json-format-v1';

@Injectable({ providedIn: 'root' })
export class ContentTypeItemService extends EntityCollectionServiceBase<EavEntity> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentTypeItem', serviceElementsFactory);
  }

  /** Add new content type items to the store */
  addContentTypeItems(contentTypeItems1: Entity1[]) {
    const contentTypeItems = EavEntity.convertMany(contentTypeItems1);
    this.upsertManyInCache(contentTypeItems);
  }

  /** Get content type item observable from the store */
  getContentTypeItemByGuid(guid: string) {
    return this.entities$.pipe(
      map(contentTypeItems => contentTypeItems.find(contentTypeItem => contentTypeItem.Guid === guid))
      // maybe add distinctUntilChanged()
    );
  }
}
