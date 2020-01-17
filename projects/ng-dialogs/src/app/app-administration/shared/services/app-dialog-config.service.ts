import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Context } from '../../../shared/context/context';
import { DialogSettings } from '../models/dialog-settings.model';

@Injectable()
export class AppDialogConfigService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getDialogSettings() {
    return <Observable<DialogSettings>>this.http.get(`/desktopmodules/2sxc/api/app-sys/system/dialogsettings?appId=${this.context.appId}`);
  }

}
