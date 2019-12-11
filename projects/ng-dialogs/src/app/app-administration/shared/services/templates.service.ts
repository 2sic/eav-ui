import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TemplatesService {
  constructor(
    private http: HttpClient,
  ) { }

  getAll(appId: number) {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/template/getall?appId=${appId}`);
  }

}
