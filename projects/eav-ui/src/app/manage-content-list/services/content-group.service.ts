import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { ReplaceConfig } from '../../replace-content/replace-config.model';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentGroupAdd, ParentReference } from '../models/content-group.model';
import { GroupHeader } from '../models/group-header.model';

const webApiContentGroupItemList = 'cms/list/items';
const webApiContentGroupReplace = 'cms/list/replace';
const removeItem = 'cms/list/delete';
const webApiContentGroupReplaceOptions = 'cms/list/replaceoptions';
const webApiContentGroupHeader = 'cms/list/contentblockheader';

// TODO: @2rb - this would be great to convert to signals, would require all the code to be updated
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

  // This one is already nice, using signals
  getHeaderResource(contentGroup: ParentReference, refresh: Signal<unknown>): HttpResourceRef<GroupHeader[]> {
    return httpResource<GroupHeader[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiContentGroupHeader),
        params: { ...this.#getParams(contentGroup, false) }
      });
    }, { defaultValue: [] });
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
