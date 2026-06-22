import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { ReplaceConfig } from '../../replace-content/replace-config.model';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentGroup, ContentGroupAdd } from '../models/content-group.model';
import { GroupHeader } from '../models/group-header.model';

const webApiContentGroupReplace = 'cms/contentgroup/replace';
const webApiContentGroupItemList = 'cms/contentgroup/itemlist';
const webApiContentGroupHeader = 'cms/contentgroup/header';
const removeItem = 'cms/list/delete';

@Injectable()
export class ContentGroupService extends HttpServiceBaseSignal {

  getItemsPromise(item: ContentGroup): Promise<ReplaceConfig> {
    return this.fetchPromise<ReplaceConfig>(webApiContentGroupReplace, {
      params: {
        ...this.getParams(item, true),
        index: item.index.toString(),
        ...(item.contentType ? { contentType: item.contentType } : {})
      }
    });
  }

  saveItem(item: ContentGroupAdd) {
    return this.http.post<null>(this.apiUrl(webApiContentGroupReplace), {}, {
      params: {
        ...this.getParams(item, true),
        // parent: item.guid,
        // part: item.part,
        index: item.index.toString(),
        entityId: item.id ?? 0,
        add: `${item.add}`
      }
    });
  }

  removeItem(contentGroup: ContentGroup, index: number) {
    // note: the server checks if the part == 'content' and will automatically treat it as a pair with presentation
    return this.http.delete<null>(this.apiUrl(removeItem), {
      params: { index: index, parent: contentGroup.guid, fields: contentGroup.part }
    });
  }

  getListPromise(contentGroup: ContentGroup): Promise<GroupHeader[]> {
    return this.fetchPromise<GroupHeader[]>(webApiContentGroupItemList, {
      params: this.getParams(contentGroup, true)
    });
  }

  saveList(contentGroup: ContentGroup, resortedList: GroupHeader[]) {
    return this.http.post<boolean>(this.apiUrl(webApiContentGroupItemList), resortedList, {
      params: this.getParams(contentGroup, true)
    });
  }

  getAllLive(contentGroup: ContentGroup, refresh: Signal<unknown>) {
    return httpResource<GroupHeader>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiContentGroupHeader),
        params: this.getParams(contentGroup)
      });
    });
  }

  getParams(contentGroup: ContentGroup, withPart?: boolean) {
    return {
      appId: this.appId,
      parent: contentGroup.guid,
      ...(withPart ? { part: contentGroup.part } : {}),
    };
  }
}
