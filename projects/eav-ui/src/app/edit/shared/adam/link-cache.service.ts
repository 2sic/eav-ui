import { Injectable } from '@angular/core';
import { AdamItem } from '../../../../../../edit-types';
import { LinkInfo, PrefetchAdams, PrefetchLinks } from '../../dialog/main/edit-dialog-main.models';
import { SignalStoreBase } from '../store/signal-store-base';
import { classLog } from '../../../shared/logging';

/**
 * The link Cache will store info to all links incl. file references (ADAM)
 * to provide previews and link-resolution (eg. file:72 = /assets/icon.jpg)
 */
@Injectable({ providedIn: 'root' })
export class LinkCacheService extends SignalStoreBase<string, LinkCache> {

  log = classLog({LinkCacheService});
  
  constructor() {
    super();
    this.constructorEnd();
  }

  override getId = (item: LinkCache) => item.key.trim().toLocaleLowerCase();

  addPrefetch(prefetchLinks: PrefetchLinks, prefetchAdam: PrefetchAdams): void {

    // Convert PrefetchLinks to LinkCache
    const links: LinkCache[] = prefetchLinks
      ? Object.entries(prefetchLinks)
          .map(([key, linkInfo]) => ({ key, ...linkInfo }))
      : [];

    // Convert PrefetchAdam to LinkCache
    // This is more complex, as the raw data is nested
    const adamLinkList: LinkCache[] = prefetchAdam != null
      ? Object.entries(prefetchAdam)
          .flatMap(([_, prefetchFields]) => Object.entries(prefetchFields)
            .flatMap(([__, items]) => this.adamToLinks(items))
          )
      : [];

    this.addMany([ ...links, ...adamLinkList ]);
  }

  /** Add a new ADAM which was just uploaded */
  addAdam(items: AdamItem[]): void {
    this.addMany(this.adamToLinks(items));
  }

  /** Add a link which was just added (typed/selected) in the UI */
  addLink(key: string, linkInfo: LinkInfo): void {
    key = key.trim().toLocaleLowerCase();
    const link: LinkCache = {
      key,
      ...linkInfo,
      Adam: {
        ...linkInfo.Adam,
      },
    } satisfies LinkCache;

    this.add(link);
  }

  //#endregion

  private adamToLinks(items: AdamItem[]): LinkCache[] {
    return items
      .filter(item => !item.IsFolder)
      .map(item => ({
        key: item.ReferenceId,
        Adam: { ...item },
        Value: item.Url,
      } satisfies LinkCache));
  }
}


interface LinkCache extends LinkInfo{
  key: string;
}
