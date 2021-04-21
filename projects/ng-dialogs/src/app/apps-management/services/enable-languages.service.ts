import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnableLanguage } from '../models/enable-language.model';

const webApiZoneRoot = 'admin/zone/';

@Injectable()
export class EnableLanguagesService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get<EnableLanguage[]>(this.dnnContext.$2sxc.http.apiUrl(webApiZoneRoot + 'getlanguages'));
  }

  toggle(code: string, enable: boolean) {
    return this.http.get<null>(this.dnnContext.$2sxc.http.apiUrl(webApiZoneRoot + 'switchlanguage'), {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  // todo: this code is _identical_ to toggle above. one should be removed, but I don't know where they are used
  save(code: string, enable: boolean) {
    return this.http.get<null>(this.dnnContext.$2sxc.http.apiUrl(webApiZoneRoot + 'switchlanguage'), {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }
}
