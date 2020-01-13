import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Context } from '../../../shared/context/context';

@Injectable()
export class TemplatesService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getAll() {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/template/getall?appId=${this.context.appId}`);
  }

}
