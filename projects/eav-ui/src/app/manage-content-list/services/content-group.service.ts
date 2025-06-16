import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { ReplaceConfig } from '../../replace-content/replace-config.model';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentGroup, ContentGroupAdd } from '../models/content-group.model';
import { GroupHeader } from '../models/group-header.model';

const webApiContentGroup = 'cms/contentgroup/';
const webApiContentGroupReplace = webApiContentGroup + 'replace';
const webApiContentGroupItemlist = webApiContentGroup + 'itemlist';
const webApiContentGroupHeader = webApiContentGroup + 'header';
const removeItem = 'cms/list/delete';

@Injectable()
export class ContentGroupService extends HttpServiceBaseSignal {

  getItemsPromise(item: ContentGroup): Promise<ReplaceConfig> {
    return this.fetchPromise<ReplaceConfig>(webApiContentGroupReplace, {
      params: { appId: this.appId, guid: item.guid, part: item.part, index: item.index.toString() }
    });
  }

  saveItem(item: ContentGroupAdd) {
    return this.http.post<null>(this.apiUrl(webApiContentGroupReplace), {}, {
      params: { guid: item.guid, part: item.part, index: item.index.toString(), entityId: item.id.toString(), add: `${item.add}` }
    });
  }

  removeItem(contentGroup: ContentGroup, index: number) {
    // note: the server checks if the part == 'content' and will automatically treat it as a pair with presentation
    return this.http.delete<null>(this.apiUrl(removeItem), {
      params: { index: index, parent: contentGroup.guid, fields: contentGroup.part }
    });
  }

  getListPromise(contentGroup: ContentGroup): Promise<GroupHeader[]> {
    return this.fetchPromise<GroupHeader[]>(webApiContentGroupItemlist, {
      params: { appId: this.appId, guid: contentGroup.guid, part: contentGroup.part }
    });
  }

  saveList(contentGroup: ContentGroup, resortedList: GroupHeader[]) {
    return this.http.post<boolean>(this.apiUrl(webApiContentGroupItemlist), resortedList, {
      params: { appId: this.appId, guid: contentGroup.guid, part: contentGroup.part }
    });
  }

  getAllLive(contentGroup: ContentGroup, refresh: Signal<unknown>) {
    return httpResource<GroupHeader>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiContentGroupHeader),
        params: { appId: this.appId, guid: contentGroup.guid }
      });
    });
  }

}
