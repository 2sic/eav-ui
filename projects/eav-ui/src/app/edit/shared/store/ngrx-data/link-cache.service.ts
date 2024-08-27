import { Injectable } from '@angular/core';
import { AdamItem } from '../../../../../../../edit-types';
import { LinkCache, LinkInfo, PrefetchAdams, PrefetchLinks } from '../../../dialog/main/edit-dialog-main.models';

@Injectable({ providedIn: 'root' })
export class LinkCacheService /* extends BaseDataService<LinkCache> Old Code */ {

  list: Record<string, LinkCache> = {};

  // TODO:: Old Code, remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('LinkCache', serviceElementsFactory);
  // }

  //#region Add / Clear Cache

  private addToCache(links: LinkCache[]): void {
    // this.upsertManyInCache(links); // TODO:: Old Code, remove after testing ist done

    // add all links cache to list
    links.forEach(link => {
      this.list[link.key.toLocaleLowerCase()] = link;
    });

  }

  public clearCache(): void {
    this.list = {};
  }

  addPrefetch(prefetchLinks: PrefetchLinks, prefetchAdam: PrefetchAdams): void {

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
    this.addToCache(links);
  }

  addAdam(items: AdamItem[]): void {
    const adamLinks = this.adamToLinks(items);
    this.addToCache(adamLinks);
  }

  addLink(key: string, linkInfo: LinkInfo): void {
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

    this.addToCache([link]);
  }

  //#endregion

  //#region Getters

  getLinkInfo(key: string): LinkInfo {
    key = key.trim().toLocaleLowerCase();
    // TODO:: Old Code, remove after testing ist done
    // return this.cache().find(linkCache => linkCache.key.trim().toLocaleLowerCase() === key)?.linkInfo;
    return this.list[key]?.linkInfo;
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

  //#endregion

}
