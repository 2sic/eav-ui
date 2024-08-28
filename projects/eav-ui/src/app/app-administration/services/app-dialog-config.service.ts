import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { Context } from '../../shared/services/context';
import { FeaturesService } from '../../features/features.service';
import { EavLogger } from '../../shared/logging/eav-logger';
import { GlobalConfigService } from '../../shared/services/global-config.service';

const logThis = false;
const nameOfThis = 'AppDialogConfigService';

const webApiSettings = 'admin/dialog/settings';

/**
 * Service for getting dialog settings for the current app.
 * 
 * Note that it should normally be shared, to save resources / network calls.
 */
@Injectable()
export class AppDialogConfigService {

  log = new EavLogger(nameOfThis, logThis);

  constructor(
    private http: HttpClient,
    private context: Context,
    private globalConfigService: GlobalConfigService,
    featuresService: FeaturesService,
  ) {
    this.log.a(`using context #${this.context.log.svcId}`);
    featuresService.loadFromService(this);
  }

  private dialogSettings$: Record<number, Observable<DialogSettings>> = {};

  getCurrent$(): Observable<DialogSettings> {
    const appId = this.context.appId;
    this.log.a(`getCurrent\$ - appId:${appId}`);
    return this.getShared$(appId);
  }

  getShared$(appId: number): Observable<DialogSettings> {
    this.log.a('getShared$ appId: ' + appId);
    this.dialogSettings$[appId] ??= this.getDialogSettings(appId, 'getShared$')
      .pipe(shareReplay({ refCount: false }));
    return this.dialogSettings$[appId];
  }

  private getDialogSettings(appId?: number, reqBy?: string): Observable<DialogSettings> {
    this.log.a('getDialogSettings', {appId, reqBy});
    return this.http.get<DialogSettings>(webApiSettings, {
      params: { appId: appId ?? this.context.appId.toString() },
    }).pipe(
      map(dlgSettings => {
        dlgSettings.Context.Language.List = dlgSettings.Context.Language.List.filter(language => language.IsEnabled);
        return dlgSettings;
      }),
      tap(dlgSettings => {
        this.globalConfigService.allowDebug(dlgSettings.Context.Enable.DebugMode);
      }),
    );
  }
}
