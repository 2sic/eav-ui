import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { Context } from '../../shared/services/context';
import { DialogSettings } from '../models/dialog-settings.model';

const webApiDialogRoot = 'admin/dialog/';

@Injectable()
export class AppDialogConfigService {
  constructor(
    private http: HttpClient,
    private context: Context,
    private dnnContext: DnnContext,
    private globalConfigService: GlobalConfigService,
  ) { }

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
