import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReplaceConfig } from '../../replace-content/models/replace-config.model';
import { Context } from '../../shared/services/context';
import { ContentGroup, ContentGroupAdd } from '../models/content-group.model';
import { GroupHeader } from '../models/group-header.model';

const webApiContentGroup = 'cms/contentgroup/';

@Injectable()
export class ContentGroupService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getItems(item: ContentGroup) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'replace'), {
      params: { appId: this.context.appId.toString(), guid: item.guid, part: item.part, index: item.index.toString() }
    }) as Observable<ReplaceConfig>;
  }

  saveItem(item: ContentGroupAdd) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'replace'), {}, {
      params: { guid: item.guid, part: item.part, index: item.index.toString(), entityId: item.id.toString(), add: `${item.add}` }
    }) as Observable<null>;
  }

  getList(contentGroup: ContentGroup) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'itemlist'), {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid, part: contentGroup.part }
    }) as Observable<GroupHeader[]>;
  }

  saveList(contentGroup: ContentGroup, resortedList: GroupHeader[]) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'itemlist'), resortedList, {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid, part: contentGroup.part }
    }) as Observable<boolean>;
  }

  getHeader(contentGroup: ContentGroup) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiContentGroup + 'header'), {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid }
    }) as Observable<GroupHeader>;
  }

}
