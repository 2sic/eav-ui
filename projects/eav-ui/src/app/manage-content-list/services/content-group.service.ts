import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaceConfig } from '../../replace-content/models/replace-config.model';
import { Context } from '../../shared/services/context';
import { ContentGroup, ContentGroupAdd } from '../models/content-group.model';
import { GroupHeader } from '../models/group-header.model';

const webApiContentGroup = 'cms/contentgroup/';

@Injectable()
export class ContentGroupService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getItems(item: ContentGroup) {
    return this.http.get<ReplaceConfig>(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'replace'), {
      params: { appId: this.context.appId.toString(), guid: item.guid, part: item.part, index: item.index.toString() }
    });
  }

  saveItem(item: ContentGroupAdd) {
    return this.http.post<null>(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'replace'), {}, {
      params: { guid: item.guid, part: item.part, index: item.index.toString(), entityId: item.id.toString(), add: `${item.add}` }
    });
  }

  // TODO: @2DM 
  removeItem(contentGroup: ContentGroup, index: number) {
    return this.http.delete<null>(this.dnnContext.$2sxc.http.apiUrl('cms/list/delete'), {
      params: { index: index, parent: contentGroup.guid, fields: 'content,presentation' }
    });
  }

  getList(contentGroup: ContentGroup) {
    return this.http.get<GroupHeader[]>(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'itemlist'), {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid, part: contentGroup.part }
    });
  }

  saveList(contentGroup: ContentGroup, resortedList: GroupHeader[]) {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'itemlist'), resortedList, {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid, part: contentGroup.part }
    });
  }

  getHeader(contentGroup: ContentGroup) {
    return this.http.get<GroupHeader>(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'header'), {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid }
    });
  }
}
