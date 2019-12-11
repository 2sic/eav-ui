import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppDialogConfigService {
  constructor(
    private http: HttpClient,
  ) { }

  getDialogSettings(appId: number) {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/system/dialogsettings?appId=${appId}`);
  }

}
