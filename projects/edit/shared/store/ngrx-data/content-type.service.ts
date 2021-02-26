import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavContentType } from '../../models/eav';
import { ContentType1 } from '../../models/json-format-v1';

@Injectable({ providedIn: 'root' })
export class ContentTypeService extends EntityCollectionServiceBase<EavContentType> {
  private contentTypes$: BehaviorSubject<EavContentType[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('ContentType', serviceElementsFactory);

    this.contentTypes$ = new BehaviorSubject<EavContentType[]>([]);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(contentTypes => {
      this.contentTypes$.next(contentTypes);
    });
  }

  addContentTypes(contentTypes1: ContentType1[]): void {
    const contentTypes = contentTypes1.map(contentType1 => EavContentType.convert(contentType1));
    this.addManyToCache(contentTypes);
  }

  getContentType(id: string): EavContentType {
    return this.contentTypes$.value.find(contentType => contentType.Id === id);
  }

  getContentType$(id: string): Observable<EavContentType> {
    return this.contentTypes$.pipe(
      map(contentTypes => contentTypes.find(contentType => contentType.Id === id)),
      distinctUntilChanged(),
    );
  }
}
