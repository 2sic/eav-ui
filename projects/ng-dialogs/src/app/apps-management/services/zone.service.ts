import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SiteLanguage } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';

const webApiZoneRoot = 'admin/zone/';

@Injectable()
export class ZoneService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getLanguages() {
    return this.http.get<SiteLanguage[]>(this.dnnContext.$2sxc.http.apiUrl(webApiZoneRoot + 'GetLanguages'));
  }

  toggleLanguage(code: string, enable: boolean) {
    return this.http.get<null>(this.dnnContext.$2sxc.http.apiUrl(webApiZoneRoot + 'SwitchLanguage'), {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  getSystemInfo() {
    return this.http.get<SystemInfoSet>(this.dnnContext.$2sxc.http.apiUrl(webApiZoneRoot + 'GetSystemInfo'));
  }
}
