import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject } from 'rxjs';
import { EavEntity } from '../../models/eav';
import { Entity1 } from '../../models/json-format-v1';

@Injectable({ providedIn: 'root' })
export class ContentTypeItemService extends EntityCollectionServiceBase<EavEntity> {
  private contentTypeItems$: BehaviorSubject<EavEntity[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentTypeItem', serviceElementsFactory);

    this.contentTypeItems$ = new BehaviorSubject<EavEntity[]>([]);
    // doesn't need to be completed because store services are singletons that lives as long as the browser tab is open
    this.entities$.subscribe(contentTypeItems => {
      this.contentTypeItems$.next(contentTypeItems);
    });
  }

  addContentTypeItems(contentTypeItems1: Entity1[]): void {
    const contentTypeItems = EavEntity.convertMany(contentTypeItems1);
    this.upsertManyInCache(contentTypeItems);
  }

  getContentTypeItem(guid: string): EavEntity {
    return this.contentTypeItems$.value.find(contentTypeItem => contentTypeItem.Guid === guid);
  }
}
