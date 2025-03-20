import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { classLog } from '../../shared/logging';
import { webApiEntityList } from '../../shared/services/entity.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Query } from '../models/query.model';

const logSpecs = {
  all: true,
  getAll: false,
  getAllSig: true,
  getAllRes: true,
  importQuery: false,
  clonePipeline: false,
  delete: false,  
  update: false,
};

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

  log = classLog({ PipelinesService }, logSpecs);

  getAll(contentType: string) {
    const l = this.log.fnIf('getAll');
    return l.r(this.getHttpApiUrl<Query[]>(webApiEntityList, {
      params: { appId: this.appId, contentType }
    }));
  }

  getAllSig(contentType: string, initial?: Query[]) {
    const l = this.log.fnIf('getAllSig');
    const sig =  this.getSignal<Query[]>(webApiEntityList, {
      params: { appId: this.appId, contentType }
    }, initial);
    return l.r(sig);
  }

  /** Experimental httpResource use! */
  getAllRes(contentType: string, initial?: Query[]) {
    const l = this.log.fnIf('getAllRes');
    const res = httpResource<Query[]>(() => ({
      url: webApiEntityList,
      params: { appId: this.appId, contentType },
    }), { defaultValue: initial });
    return l.r(res);
  }

  importQuery(file: File) {
    const l = this.log.fnIf('importQuery');
    const obs = from(toBase64(file)).pipe(
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
    return l.r(obs);
  }

  clonePipeline(id: number) {
    const l = this.log.fnIf('clonePipeline');
    const obs = this.getHttpApiUrl<null>(webApiQueryClone, {
      params: { Id: id.toString(), appId: this.appId }
    });
    return l.r(obs);
  }

  delete(id: number) {
    const l = this.log.fnIf('delete');
    const obs = this.http.delete<boolean>(this.apiUrl(webApiQueryDelete), {
      params: { appId: this.appId, Id: id.toString() },
    });
    return l.r(obs);
  }
}
