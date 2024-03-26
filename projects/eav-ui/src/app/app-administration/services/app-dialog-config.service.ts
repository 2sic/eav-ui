import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { Context } from '../../shared/services/context';
import { FeaturesService } from '../../shared/services/features.service';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { DialogContextSiteApp } from '../../shared/models/dialog-context.models';

const logThis = false;

const webApiSettings = 'admin/dialog/settings';


@Injectable()
export class AppDialogConfigService extends ServiceBase implements OnDestroy {
  constructor(
    private http: HttpClient,
    private context: Context,
    // private dnnContext: DnnContext,
    private globalConfigService: GlobalConfigService,
    featuresService: FeaturesService,
  ) {
    super(new EavLogger('AppDialogConfigService', logThis));
    this.logger.add('using context #', this.context.logger.svcId);
    featuresService.loadFromService(this);
  }

  ngOnDestroy(): void {
    super.destroy();
    // TODO: probably should add an onDestroy and ensure all subscriptions in dialogSettings$ are killed
  }

  private dialogSettings$: Record<number, Observable<DialogSettings>> = {};

  getCurrent$(): Observable<DialogSettings> {
    const appId = this.context.appId;
    this.logger.add('getCurrent$', 'appId', appId);
    return this.getShared$(appId);
  }

    // new 2dg
    getSitePrimaryApp$(): Observable<DialogContextSiteApp> {
      return this.getCurrent$().pipe(map(dc => dc?.Context.Site.PrimaryApp));
    }
  
    getGlobalPrimaryApp$(): Observable<DialogContextSiteApp> {
      return this.getCurrent$().pipe(map(dc => dc?.Context.System.PrimaryApp));
    }
  

  getShared$(appId: number): Observable<DialogSettings> {
    this.logger.add('getShared$', 'appId', appId);
    // if (!this.dialogSettings$[appIdToUse])
    this.dialogSettings$[appId] ??= this.getDialogSettings(appId, 'getShared$').pipe(shareReplay({ refCount: false }));
    return this.dialogSettings$[appId];
  }

  getDialogSettings(appId?: number, reqBy?: string): Observable<DialogSettings> {
    this.logger.add('getDialogSettings', 'appId', appId, 'reqBy', reqBy);
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
