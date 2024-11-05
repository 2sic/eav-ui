import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Version } from '../models/version.model';

const webApiVersionsGet = 'cms/history/get';
const webApiVersionsRestore = 'cms/history/restore';

@Injectable()
export class VersionsService extends HttpServiceBase {

  fetchVersions(entityId: number, initial: Version[] = null) {
    return this.postSignal<Version[]>(
      webApiVersionsGet,
      { entityId },
      {
        params: { appId: this.appId },
      },
      initial,
    );
  }

  restore(entityId: number, changeId: number) {
    return this.http.post<boolean>(
      this.apiUrl(webApiVersionsRestore),
      { entityId },
      {
        params: { appId: this.appId, changeId: changeId.toString() },
      },
    );
  }
}
