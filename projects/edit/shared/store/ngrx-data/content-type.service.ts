import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map } from 'rxjs/operators';

import { ContentType } from '../../models/eav';
import { JsonContentType1 } from '../../models/json-format-v1';

@Injectable({ providedIn: 'root' })
export class ContentTypeService extends EntityCollectionServiceBase<ContentType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentType', serviceElementsFactory);
  }

  /** Add new content types to the store */
  addContentTypes(rawContentTypes: JsonContentType1[]) {
    const builtContentTypes = rawContentTypes.map(rawCT => ContentType.create(rawCT));
    this.addManyToCache(builtContentTypes);
  }

  /** Get content type observable from the store */
  getContentTypeById(id: string) {
    return this.entities$.pipe(
      map(contentTypes => contentTypes.find(contentType => contentType.contentType.id === id))
      // maybe add distinctUntilChanged()
    );
  }
}
