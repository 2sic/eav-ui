import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/context/context';
import { DialogSettings } from '../models/dialog-settings.model';

@Injectable()
export class AppDialogConfigService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getDialogSettings() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/dialogsettings'), {
      params: { appid: this.context.appId.toString() },
    }) as Observable<DialogSettings>;
  }
}
