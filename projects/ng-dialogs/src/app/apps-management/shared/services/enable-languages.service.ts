import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { EnableLanguage } from '../models/enable-language.model';

@Injectable()
export class EnableLanguagesService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getAll() {
    return <Observable<EnableLanguage[]>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/getlanguages'));
  }

  toggle(code: string, enable: boolean) {
    return <Observable<null>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/switchlanguage'), {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  save(code: string, enable: boolean) {
    return <Observable<null>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/switchlanguage'), {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }
}
