import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { Context } from '../../shared/services/context';
import { DialogConfigGlobalService } from './dialog-config-global.service';
import { classLog } from '../../shared/logging';

/**
 * Context aware dialog configuration service.
 * 
 * It uses the shared service so the settings are cached when re-requested by anything else.
 */
@Injectable()
export class DialogConfigAppService {

  log = classLog({DialogConfigAppService});

  constructor(private contextSvcShared: DialogConfigGlobalService, private context: Context) { }

  getCurrent$(): Observable<DialogSettings> {
    const appId = this.context.appId;
    this.log.a(`getCurrent\$ - appId:${appId}`);
    return this.contextSvcShared.getShared$(appId);
  }
}
