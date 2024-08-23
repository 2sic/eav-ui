import { Injectable } from '@angular/core';
import { EavEntity } from '../../models/eav';
import { EavEntityDto } from '../../models/json-format-v1';

@Injectable({ providedIn: 'root' })
export class ContentTypeItemService /* extends BaseDataService<EavEntity> TODO:: Old Code */ {

  contentTypeItems: Record<string, EavEntity> = {};

      // TODO:: Old Code, remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('ContentTypeItem', serviceElementsFactory);
  // }

  addContentTypeItems(contentTypeItems1: EavEntityDto[]): void {
    const contentTypeItems = EavEntity.convertMany(contentTypeItems1);
    this.addToCache(contentTypeItems);
  }

  getContentTypeItem(guid: string): EavEntity {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache().find(contentTypeItem => contentTypeItem.Guid === guid);
    return this.contentTypeItems[guid];
  }

  getContentTypeItems(guids: string[]): EavEntity[] {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache().filter(contentTypeItem => guids.includes(contentTypeItem.Guid));
    return guids.map(guid => this.contentTypeItems[guid]);
  }

  private addToCache(contentTypeItems: EavEntity[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.upsertManyInCache(contentTypeItems);

    contentTypeItems.forEach(content => {
      this.contentTypeItems[content.Guid] = content;
    });
  }

  public clearCache(): void {
    this.contentTypeItems = {};
  }

}
