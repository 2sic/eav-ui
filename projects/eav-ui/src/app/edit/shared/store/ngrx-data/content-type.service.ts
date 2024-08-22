import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable, of } from 'rxjs';
import { EavContentType } from '../../models/eav';
import { EavContentTypeDto } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';
import { mapUntilChanged } from '../../../../shared/rxJs/mapUntilChanged';

@Injectable({ providedIn: 'root' })
export class ContentTypeService /* extends BaseDataService<EavContentType> TOOD:: remove later */ {

  contentTypes: Record<string, EavContentType> = {};

  // TODO:: Old Code, remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('ContentType', serviceElementsFactory);
  // }

  addContentTypes(contentTypes1: EavContentTypeDto[]): void {
    const contentTypes = EavContentType.convertMany(contentTypes1);
    this.addToCache(contentTypes);
  }

  getContentType(id: string): EavContentType {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache().find(contentType => contentType.Id === id);
    return this.contentTypes[id];
  }

  getContentType$(id: string): Observable<EavContentType> {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache$.pipe(
    //   map(contentTypes => contentTypes.find(contentType => contentType.Id === id)),
    //   mapUntilChanged(m => m),
    // );
    return of(this.contentTypes[id]);
  }

  private addToCache(contentTypes: EavContentType[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.addManyToCache(contentTypeItems);

    contentTypes.forEach(content => {
      this.contentTypes[content.Id] = content;
    });
  }

  public clearCache(): void {
    this.contentTypes = {};
  }

}
