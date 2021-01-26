import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map } from 'rxjs/operators';
import { EavContentType } from '../../models/eav';
import { ContentType1 } from '../../models/json-format-v1';

@Injectable({ providedIn: 'root' })
export class ContentTypeService extends EntityCollectionServiceBase<EavContentType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentType', serviceElementsFactory);
  }

  /** Add new content types to the store */
  addContentTypes(contentTypes1: ContentType1[]) {
    const contentTypes = contentTypes1.map(contentType1 => EavContentType.convert(contentType1));
    this.addManyToCache(contentTypes);
  }

  /** Get content type observable from the store */
  getContentTypeById(id: string) {
    return this.entities$.pipe(
      map(contentTypes => contentTypes.find(contentType => contentType.Id === id))
      // maybe add distinctUntilChanged()
    );
  }
}
