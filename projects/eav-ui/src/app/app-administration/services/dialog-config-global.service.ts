import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { Context } from '../../shared/services/context';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { classLog } from '../../shared/logging';

const webApiSettings = 'admin/dialog/settings';

/**
 * Service for getting dialog settings for the current app.
 * 
 * Note that it should normally be shared, to save resources / network calls.
 */
@Injectable({ providedIn: 'root' })
export class DialogConfigGlobalService {

  log = classLog({DialogConfigGlobalService});

  constructor(
    private http: HttpClient,
    private context: Context,
    private globalConfigService: GlobalConfigService,
  ) {
    this.log.a(`using context #${this.context.log.svcId}`);
  }

  private dialogSettings$: Record<number, Observable<DialogSettings>> = {};

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
