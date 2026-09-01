import { Injectable } from '@angular/core';
import { transient } from 'projects/core';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { Version } from '../models/version.model';

const webApiVersionsRestore = 'cms/history/restore';

@Injectable()
export class VersionsService extends HttpServiceBaseSignal {
  #sysData = transient(SysDataService);

  fetchVersions(entityId: number, initial: Version[] = null) {
    return this.#sysData.get<Version>({
      source: 'System.ItemHistory',
      params: { EntityId: entityId },
      noCamel: true,
    });
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
