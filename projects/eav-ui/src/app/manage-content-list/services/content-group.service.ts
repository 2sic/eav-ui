import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { ReplaceConfig } from '../../replace-content/replace-config.model';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentGroupAdd, ParentReference } from '../models/content-group.model';
import { GroupHeader } from '../models/group-header.model';

// These must still be moved to the list controller somehow
const webApiContentGroupHeader = 'cms/list/contentblockheader';

const webApiContentGroupItemList = 'cms/list/items';
const webApiContentGroupReplace = 'cms/list/replace';
const webApiContentGroupReplaceOptions = 'cms/list/replaceoptions';
const removeItem = 'cms/list/delete';

@Injectable()
export class ContentGroupService extends HttpServiceBaseSignal {

  getItemsPromise(item: ParentReference, contentType?: string): Promise<ReplaceConfig> {
    return this.fetchPromise<ReplaceConfig>(webApiContentGroupReplaceOptions, {
      params: {
        ...this.#getParams(item, true, item.index),
        ...(contentType ? { contentType } : {})
      }
    });
  }

  saveItem(item: ContentGroupAdd) {
    return this.http.post<null>(this.apiUrl(webApiContentGroupReplace), {}, {
      params: {
        ...this.#getParams(item, true, item.index),
        entityId: item.id ?? 0,
        add: `${item.add}`
      }
    });
  }

  removeItem(contentGroup: ParentReference, index: number) {
    // note: the server checks if the part == 'content' and will automatically treat it as a pair with presentation
    return this.http.delete<null>(this.apiUrl(removeItem), {
      params: this.#getParams(contentGroup, true, index)
    });
  }

  getListPromise(contentGroup: ParentReference): Promise<GroupHeader[]> {
    return this.fetchPromise<GroupHeader[]>(webApiContentGroupItemList, {
      params: this.#getParams(contentGroup, true)
    });
  }

  saveList(contentGroup: ParentReference, resortedList: GroupHeader[]) {
    return this.http.post<boolean>(this.apiUrl(webApiContentGroupItemList), resortedList, {
      params: this.#getParams(contentGroup, true)
    });
  }

  getHeaderResource(contentGroup: ParentReference, refresh: Signal<unknown>) {
    return httpResource<GroupHeader[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiContentGroupHeader /* webApiContentGroupHeader */),
        params: { ...this.#getParams(contentGroup, false) }
      });
    });
  }

  #getParams(contentGroup: ParentReference, withPart: boolean, index?: number) {
    return {
      appId: this.appId,
      parent: contentGroup.guid,
      ...(withPart ? { part: contentGroup.part } : {}),
      ...(index !== undefined ? { index } : {}),
    };
  }
}
