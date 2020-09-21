import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../shared/services/context';
import { DialogSettings } from '../models/dialog-settings.model';

const webApiDialogRoot = 'admin/dialog/';

@Injectable()
export class AppDialogConfigService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getDialogSettings() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiDialogRoot + 'settings'), {
      params: { appid: this.context.appId.toString() },
    }) as Observable<DialogSettings>;
  }
}
