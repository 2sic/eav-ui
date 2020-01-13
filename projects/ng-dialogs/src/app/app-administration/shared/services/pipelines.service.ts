import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Context } from '../../../shared/context/context';

@Injectable()
export class PipelinesService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getAll(contentType: string) {
    return this.http.get(`/desktopmodules/2sxc/api/eav/Entities/GetEntities?appId=${this.context.appId}&contentType=${contentType}`);
  }

}
