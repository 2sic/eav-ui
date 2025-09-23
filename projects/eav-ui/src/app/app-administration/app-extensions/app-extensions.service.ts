import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { classLog } from '../../shared/logging';
import { Context } from '../../shared/services/context';

@Injectable()
export class AppExtensionsService {
  log = classLog({ AppExtensionsService });

  constructor(private http: HttpClient, private context: Context) { }

  getExtensions$(): Observable<any> {
    const url = `/api/2sxc/admin/app/Extensions?appId=${this.context.appId}`;
    this.log.a(`GET ${url}`);
    return this.http.get<any>(url, {
      withCredentials: true,
    });
  }
}
