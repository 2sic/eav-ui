import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { Context } from '../../shared/services/context';
import { EavLogger } from '../../shared/logging/eav-logger';
import { GlobalDialogConfigService } from './global-dialog-config.service';

const logThis = false;
const nameOfThis = 'DialogConfigService';

/**
 * Context aware dialog configuration service.
 * 
 * It uses the shared service so the settings are cached when re-requested by anything else.
 */
@Injectable()
export class AppDialogConfigService {

  log = new EavLogger(nameOfThis, logThis);

  constructor(private contextSvcShared: GlobalDialogConfigService, private context: Context) {
  }

  getCurrent$(): Observable<DialogSettings> {
    const appId = this.context.appId;
    this.log.a(`getCurrent\$ - appId:${appId}`);
    return this.contextSvcShared.getShared$(appId);
  }
}
