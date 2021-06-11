import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { AdamItem } from '../../../../edit-types';
import { PrefetchAdams, PrefetchLinks } from '../../../dialog/main/edit-dialog-main.models';
import { LinkCache, LinkInfo } from '../../models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class LinkCacheService extends BaseDataService<LinkCache> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('LinkCache', serviceElementsFactory);
  }

  loadPrefetch(prefetchLinks: PrefetchLinks, prefetchAdam: PrefetchAdams): void {
    const links: LinkCache[] = [];

    if (prefetchLinks != null) {
      for (const [key, linkInfo] of Object.entries(prefetchLinks)) {
        const link: LinkCache = {
          key,
          linkInfo,
        };
        links.push(link);
      }
    }

    if (prefetchAdam != null) {
      for (const [entityGuid, prefetchFields] of Object.entries(prefetchAdam)) {
        for (const [fieldName, items] of Object.entries(prefetchFields)) {
          const adamLinks = this.adamToLinks(items);
          links.push(...adamLinks);
        }
      }
    }

    this.upsertManyInCache(links);
  }

  loadAdam(items: AdamItem[]): void {
    const adamLinks = this.adamToLinks(items);
    this.upsertManyInCache(adamLinks);
  }

  loadLink(key: string, linkInfo: LinkInfo): void {
    key = key.trim().toLocaleLowerCase();
    const link: LinkCache = {
      key,
      linkInfo: {
        ...linkInfo,
        Adam: {
          ...linkInfo.Adam,
        },
      },
    };
    this.upsertOneInCache(link);
  }

  getLinkInfo(key: string): LinkInfo {
    key = key.trim().toLocaleLowerCase();
    return this.cache$.value.find(linkCache => linkCache.key.trim().toLocaleLowerCase() === key)?.linkInfo;
  }

  private adamToLinks(items: AdamItem[]): LinkCache[] {
    const links: LinkCache[] = [];

    for (const item of items) {
      if (item.IsFolder) { continue; }

      const link: LinkCache = {
        key: item.ReferenceId,
        linkInfo: {
          Adam: { ...item },
          Value: item.Url,
        },
      };
      links.push(link);
    }

    return links;
  }
}
