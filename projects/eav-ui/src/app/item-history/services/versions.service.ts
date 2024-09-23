import { Injectable } from '@angular/core';
import { Version } from '../models/version.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';

const webApiVersions = 'cms/history/';

@Injectable()
export class VersionsService extends HttpServiceBase {

  fetchVersions(entityId: number) {
    return this.http.post<Version[]>(
      this.apiUrl(webApiVersions + 'get'),
      { entityId },
      {
        params: { appId: this.appId },
      },
    );
  }

  restore(entityId: number, changeId: number) {
    return this.http.post<boolean>(
      this.apiUrl(webApiVersions + 'restore'),
      { entityId },
      {
        params: { appId: this.appId, changeId: changeId.toString() },
      },
    );
  }
}
