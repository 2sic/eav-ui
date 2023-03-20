import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { webApiEntityList } from '../../edit/shared/services';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { Context } from '../../shared/services/context';
import { Query } from '../models/query.model';

const webApiQueryImport = 'admin/query/import';
const webApiQueryClone = 'admin/query/Clone';
const webApiQueryDelete = 'admin/query/Delete';
export const webApiQueryRun = 'admin/query/Run';
export const webApiQueryDebugStream = 'admin/query/DebugStream';
export const webApiQuerySave = 'admin/query/Save';
export const webApiQueryGet = 'admin/query/Get';
export const webApiQueryDataSources = 'admin/query/DataSources';

@Injectable()
export class PipelinesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll(contentType: string) {
    return this.http.get<Query[]>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityList), {
      params: { appId: this.context.appId.toString(), contentType }
    });
  }

  importQuery(file: File) {
    return from(toBase64(file)).pipe(
      switchMap(fileBase64 => {
        return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiQueryImport), {
          AppId: this.context.appId.toString(),
          ContentBase64: fileBase64,
        });
      }),
      map(success => {
        const result: FileUploadResult = {
          Success: success,
          Messages: [],
        };
        return result;
      }),
    );
  }

  clonePipeline(id: number) {
    return this.http.get<null>(this.dnnContext.$2sxc.http.apiUrl(webApiQueryClone), {
      params: { Id: id.toString(), appId: this.context.appId.toString() }
    });
  }

  delete(id: number) {
    return this.http.delete<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiQueryDelete), {
      params: { appId: this.context.appId.toString(), Id: id.toString() },
    });
  }
}
