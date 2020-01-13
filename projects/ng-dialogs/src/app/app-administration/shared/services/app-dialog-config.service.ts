import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Context } from '../../../shared/context/context';

@Injectable()
export class AppDialogConfigService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getDialogSettings() {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/system/dialogsettings?appId=${this.context.appId}`);
  }

}
