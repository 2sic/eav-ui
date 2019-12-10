import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class EnableLanguagesService {
  constructor(
    private http: HttpClient,
  ) { }

  getAll() {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/system/getlanguages`);
  }

  toggle(code: string, enable: boolean) {
    return this.http.get('/desktopmodules/2sxc/api/app-sys/system/switchlanguage',
      { params: { cultureCode: code, enable: enable.toString() } }
    );
  }

  save(code: string, enable: boolean) {
    return this.http.get('/desktopmodules/2sxc/api/app-sys/system/switchlanguage',
      { params: { cultureCode: code, enable: enable.toString() } }
    );
  }
}
