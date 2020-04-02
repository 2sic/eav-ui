import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/context/context';
import { ReplaceItem } from '../models/replace-item.model';
import { ReplaceConfig } from '../models/replace-group.model';

@Injectable()
export class ContentGroupService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getItems(item: ReplaceItem) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/contentgroup/replace'), {
      params: { appId: this.context.appId.toString(), guid: item.guid, part: item.part, index: item.index.toString() }
    }) as Observable<ReplaceConfig>;
  }

  saveItem(item: ReplaceItem) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/contentgroup/replace'), {}, {
      params: { guid: item.guid, part: item.part, index: item.index.toString(), entityId: item.id.toString() }
    }) as Observable<null>;
  }

}
