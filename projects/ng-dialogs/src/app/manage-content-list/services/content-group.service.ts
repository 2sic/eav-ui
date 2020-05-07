import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
import { ContentGroup } from '../models/content-group.model';
import { ReplaceConfig } from '../../replace-content/models/replace-config.model';
import { GroupHeader } from '../models/group-header.model';

@Injectable()
export class ContentGroupService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getItems(item: ContentGroup) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/contentgroup/replace'), {
      params: { appId: this.context.appId.toString(), guid: item.guid, part: item.part, index: item.index.toString() }
    }) as Observable<ReplaceConfig>;
  }

  saveItem(item: ContentGroup) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/contentgroup/replace'), {}, {
      params: { guid: item.guid, part: item.part, index: item.index.toString(), entityId: item.id.toString() }
    }) as Observable<null>;
  }

  getList(contentGroup: ContentGroup) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/contentgroup/itemlist'), {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid, part: contentGroup.part }
    }) as Observable<GroupHeader[]>;
  }

  saveList(contentGroup: ContentGroup, resortedList: GroupHeader[]) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/contentgroup/itemlist'), resortedList, {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid, part: contentGroup.part }
    }) as Observable<boolean>;
  }

  getHeader(contentGroup: ContentGroup) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/contentgroup/header'), {
      params: { appId: this.context.appId.toString(), guid: contentGroup.guid }
    }) as Observable<GroupHeader>;
  }

}
