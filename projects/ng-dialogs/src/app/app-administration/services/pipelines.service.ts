import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiEntityList } from 'projects/edit';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { Context } from '../../shared/services/context';
import { Query } from '../models/query.model';

const webApiQueryRoot = 'admin/query/';
const webApiQueryImport = webApiQueryRoot + 'import';
const webApiQueryClone = webApiQueryRoot + 'Clone';
const webApiQueryDelete = webApiQueryRoot + 'Delete';
export const webApiQueryRun = webApiQueryRoot + 'Run';
export const webApiQuerySave = webApiQueryRoot + 'Save';
export const webApiQueryGet = webApiQueryRoot + 'Get';
export const webApiQueryDataSources = webApiQueryRoot + 'DataSources';

@Injectable()
export class PipelinesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll(contentType: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiEntityList), {
      params: { appId: this.context.appId.toString(), contentType }
    }) as Observable<Query[]>;
  }

  importQuery(file: File) {
    return from(toBase64(file)).pipe(
      mergeMap(fileBase64 => {
        return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiQueryImport), {
          AppId: this.context.appId.toString(),
          ContentBase64: fileBase64,
        }) as Observable<boolean>;
      })
    );
  }

  clonePipeline(id: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiQueryClone), {
      params: { Id: id.toString(), appId: this.context.appId.toString() }
    }) as Observable<null>;
  }

  delete(id: number) {
    return this.http.delete(this.dnnContext.$2sxc.http.apiUrl(webApiQueryDelete), {
      params: { appId: this.context.appId.toString(), Id: id.toString() },
    }) as Observable<boolean>;
  }
}
