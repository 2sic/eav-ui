import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppFileCreate, webApiAppFilesAll } from 'projects/edit';
import { map } from 'rxjs/operators';
import { Context } from '../../shared/services/context';
import { WebApi } from '../models/web-api.model';

@Injectable()
export class WebApisService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get<string[]>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesAll), {
      params: { appId: this.context.appId.toString(), global: 'false', path: '', mask: '*Controller.cs', withSubfolders: 'true' },
    }).pipe(
      map(paths => {
        const webApis: WebApi[] = paths.map(path => {
          const splitIndex = path.lastIndexOf('/');
          const fileExtIndex = path.lastIndexOf('.');
          const folder = path.substring(0, splitIndex);
          const name = path.substring(splitIndex + 1, fileExtIndex);
          const webApi: WebApi = { path, folder, name };
          return webApi;
        });
        return webApis;
      }),
    );
  }

  create(name: string) {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFileCreate), {}, {
      params: { appId: this.context.appId.toString(), global: 'false', path: `api/${name}` },
    });
  }
}
