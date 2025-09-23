import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { classLog } from '../../shared/logging';
import { Context } from '../../shared/services/context';
import { Extension } from './app-extensions.component';

@Injectable()
export class AppExtensionsService {
  log = classLog({ AppExtensionsService });

  constructor(private http: HttpClient, private context: Context) { }

  extensionsResource = httpResource<{ extensions: Extension[] }>(() => ({
    url: `/api/2sxc/admin/app/Extensions?appId=${this.context.appId}`,
    method: 'GET',
    credentials: 'include',
  }));
}
