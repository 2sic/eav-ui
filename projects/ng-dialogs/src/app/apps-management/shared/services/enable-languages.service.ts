import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnableLanguage } from '../models/enable-language.model';

@Injectable()
export class EnableLanguagesService {
  constructor(
    private http: HttpClient,
  ) { }

  getAll() {
    return <Observable<EnableLanguage[]>>this.http.get(`/desktopmodules/2sxc/api/app-sys/system/getlanguages`);
  }

  toggle(code: string, enable: boolean) {
    return <Observable<any>>this.http.get('/desktopmodules/2sxc/api/app-sys/system/switchlanguage',
      { params: { cultureCode: code, enable: enable.toString() } }
    );
  }

  save(code: string, enable: boolean) {
    return <Observable<null>>this.http.get('/desktopmodules/2sxc/api/app-sys/system/switchlanguage',
      { params: { cultureCode: code, enable: enable.toString() } }
    );
  }
}
