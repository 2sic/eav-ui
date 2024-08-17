import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable } from 'rxjs';
import { EavContentType } from '../../models/eav';
import { EavContentTypeDto } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';
import { mapUntilChanged } from 'projects/eav-ui/src/app/shared/rxJs/mapUntilChanged';

@Injectable({ providedIn: 'root' })
export class ContentTypeService extends BaseDataService<EavContentType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentType', serviceElementsFactory);
  }

  addContentTypes(contentTypes1: EavContentTypeDto[]): void {
    const contentTypes = EavContentType.convertMany(contentTypes1);
    this.addManyToCache(contentTypes);
  }

  getContentType(id: string): EavContentType {
    return this.cache$.value.find(contentType => contentType.Id === id);
  }

  getContentType$(id: string): Observable<EavContentType> {
    return this.cache$.pipe(
      map(contentTypes => contentTypes.find(contentType => contentType.Id === id)),
      mapUntilChanged(m => m),
    );
  }
}
