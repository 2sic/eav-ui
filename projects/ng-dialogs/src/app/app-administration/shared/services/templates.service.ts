import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Context } from '../../../shared/context/context';
import { View } from '../models/view.model';

@Injectable()
export class TemplatesService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getAll() {
    return <Observable<View[]>>this.http.get(`/desktopmodules/2sxc/api/app-sys/template/getall?appId=${this.context.appId}`);
  }

  delete(id: number) {
    return <Observable<boolean>>(
      this.http.get('/desktopmodules/2sxc/api/app-sys/template/delete', {
        params: { appId: this.context.appId.toString(), Id: id.toString() },
      })
    );
  }
}
