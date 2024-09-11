import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { Context } from '../../shared/services/context';
import { GlobalDialogConfigService } from './global-dialog-config.service';
import { classLog } from '../../shared/logging';

/**
 * Context aware dialog configuration service.
 * 
 * It uses the shared service so the settings are cached when re-requested by anything else.
 */
@Injectable()
export class AppDialogConfigService {

  log = classLog({AppDialogConfigService});

  constructor(private contextSvcShared: GlobalDialogConfigService, private context: Context) {
  }

  getCurrent$(): Observable<DialogSettings> {
    const appId = this.context.appId;
    this.log.a(`getCurrent\$ - appId:${appId}`);
    return this.contextSvcShared.getShared$(appId);
  }
}
