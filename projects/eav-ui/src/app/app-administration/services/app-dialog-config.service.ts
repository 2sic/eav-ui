import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { Context } from '../../shared/services/context';
import { FeaturesService } from '../../shared/services/features.service';

const webApiDialogRoot = 'admin/dialog/';

@Injectable()
export class AppDialogConfigService {
  constructor(
    private http: HttpClient,
    private context: Context,
    private dnnContext: DnnContext,
    private globalConfigService: GlobalConfigService,
    featuresService: FeaturesService,
  ) {
    featuresService.loadFromService(this);
   }

  private dialogSettings$: Record<number, Observable<DialogSettings>> = {};

  getShared$(appId?: number) {
    appId ??= this.context.appId;
    if (!this.dialogSettings$[appId])
      this.dialogSettings$[appId] = this.getDialogSettings(appId).pipe(shareReplay({ refCount: false }));
    return this.dialogSettings$[appId];
    // TODO: probably should add an onDestroy and ensure all subscriptions are killed
  }

  getDialogSettings(appId?: number) {
    return this.http.get<DialogSettings>(this.dnnContext.$2sxc.http.apiUrl(webApiDialogRoot + 'settings'), {
      params: { appId: appId ?? this.context.appId.toString() },
    }).pipe(
      map(dialogSettings => {
        dialogSettings.Context.Language.List = dialogSettings.Context.Language.List.filter(language => language.IsEnabled);
        return dialogSettings;
      }),
      tap(dialogSettings => {
        this.globalConfigService.allowDebug(dialogSettings.Context.Enable.DebugMode);
      }),
    );
  }
}
