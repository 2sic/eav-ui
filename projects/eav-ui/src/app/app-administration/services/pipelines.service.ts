import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { Query } from '../models/query.model';
import { webApiEntityList } from '../../shared/services/entity.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';

const webApiQueryImport = 'admin/query/import';
const webApiQueryClone = 'admin/query/Clone';
const webApiQueryDelete = 'admin/query/Delete';
export const webApiQueryRun = 'admin/query/Run';
export const webApiQueryDebugStream = 'admin/query/DebugStream';
export const webApiQuerySave = 'admin/query/Save';
export const webApiQueryGet = 'admin/query/Get';
export const webApiQueryDataSources = 'admin/query/DataSources';

@Injectable()
export class PipelinesService extends HttpServiceBase {

  getAll(contentType: string) {
    return this.http.get<Query[]>(this.apiUrl(webApiEntityList), {
      params: { appId: this.appId, contentType }
    });
  }

  importQuery(file: File) {
    return from(toBase64(file)).pipe(
      switchMap(fileBase64 => {
        return this.http.post<boolean>(this.apiUrl(webApiQueryImport), {
          AppId: this.appId,
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
    return this.http.get<null>(this.apiUrl(webApiQueryClone), {
      params: { Id: id.toString(), appId: this.appId }
    });
  }

  delete(id: number) {
    return this.http.delete<boolean>(this.apiUrl(webApiQueryDelete), {
      params: { appId: this.appId, Id: id.toString() },
    });
  }
}
