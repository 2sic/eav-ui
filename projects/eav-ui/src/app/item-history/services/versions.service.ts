import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Context } from '../../shared/services/context';
import { Version } from '../models/version.model';

const webApiVersions = 'cms/history/';

@Injectable()
export class VersionsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  fetchVersions(entityId: number) {
    return this.http.post<Version[]>(
      this.dnnContext.$2sxc.http.apiUrl(webApiVersions + 'get'),
      { entityId },
      {
        params: { appId: this.context.appId.toString() },
      },
    );
  }

  restore(entityId: number, changeId: number) {
    return this.http.post<boolean>(
      this.dnnContext.$2sxc.http.apiUrl(webApiVersions + 'restore'),
      { entityId },
      {
        params: { appId: this.context.appId.toString(), changeId: changeId.toString() },
      },
    );
  }
}
