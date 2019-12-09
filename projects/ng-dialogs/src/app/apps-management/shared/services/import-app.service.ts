import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ImportAppService {
  constructor(
    private http: HttpClient,
  ) { }

  importApp(file: File, changedName: string, appId: number, zoneId: number) {
    const formData = new FormData();
    formData.append('AppId', appId.toString());
    formData.append('ZoneId', zoneId.toString());
    formData.append('File', file);
    formData.append('Name', changedName ? changedName : '');
    return this.http.post('/desktopmodules/2sxc/api/app-sys/ImportExport/ImportApp', formData);
  }
}
