import { Injectable } from '@angular/core';
import { ReplaceConfig } from '../../replace-content/replace-config.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { ContentGroup, ContentGroupAdd } from '../models/content-group.model';
import { GroupHeader } from '../models/group-header.model';

const webApiContentGroup = 'cms/contentgroup/';

@Injectable()
export class ContentGroupService extends HttpServiceBase {

  getItems(item: ContentGroup) {
    return this.getHttpApiUrl<ReplaceConfig>(webApiContentGroup + 'replace', {
      params: { appId: this.appId, guid: item.guid, part: item.part, index: item.index.toString() }
    });
  }

  saveItem(item: ContentGroupAdd) {
    return this.http.post<null>(this.apiUrl(webApiContentGroup + 'replace'), {}, {
      params: { guid: item.guid, part: item.part, index: item.index.toString(), entityId: item.id.toString(), add: `${item.add}` }
    });
  }

  removeItem(contentGroup: ContentGroup, index: number) {
    // note: the server checks if the part == 'content' and will automatically treat it as a pair with presentation
    return this.http.delete<null>(this.apiUrl('cms/list/delete'), {
      params: { index: index, parent: contentGroup.guid, fields: contentGroup.part }
    });
  }

  getList(contentGroup: ContentGroup) {
    return this.getHttpApiUrl<GroupHeader[]>(webApiContentGroup + 'itemlist', {
      params: { appId: this.appId, guid: contentGroup.guid, part: contentGroup.part }
    });
  }

  saveList(contentGroup: ContentGroup, resortedList: GroupHeader[]) {
    return this.http.post<boolean>(this.apiUrl(webApiContentGroup + 'itemlist'), resortedList, {
      params: { appId: this.appId, guid: contentGroup.guid, part: contentGroup.part }
    });
  }

  getHeader(contentGroup: ContentGroup, initial: GroupHeader) {
    return this.getSignal<GroupHeader>(webApiContentGroup + 'header', {
      params: { appId: this.appId, guid: contentGroup.guid }
    }, initial);
  }

}
