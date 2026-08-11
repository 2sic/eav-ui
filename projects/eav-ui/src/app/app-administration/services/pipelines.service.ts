import { computed, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { transient } from 'projects/core';
import { from, map, switchMap } from 'rxjs';
import { classLog } from '../../../../../shared/logging';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { dataSourceEntitiesAdmin } from '../../shared/services/entity.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SysDataService } from '../../shared/services/sys-data.service';
import { Query } from '../models/query.model';

const logSpecs = {
  all: true,
  getAll: false,
  getAllSig: true,
  getAllLive: false,
  getAllRes: true,
  importQuery: false,
  clonePipeline: false,
  delete: false,
  update: false,
};

const webApiQueryImport = 'admin/query/import';
const webApiQueryClone = 'admin/query/Clone';
const webApiQueryDelete = 'admin/query/Delete';
export const webApiQueryRun = 'admin/query/RunDev';
export const webApiQueryDebugStream = 'admin/query/DebugStream';
export const webApiQuerySave = 'admin/query/Save';
export const webApiQueryGet = 'admin/query/Get';
export const webApiQueryDataSources = 'admin/query/DataSources';

@Injectable()
export class PipelinesService extends HttpServiceBase {

  readonly #sysData = transient(SysDataService);
  log = classLog({ PipelinesService }, logSpecs);
  getAllSig(contentType: string, refresh?: Signal<unknown>) {
    return this.#sysData.getMany<{ Default?: Query[] }>({
      refresh,
      source: dataSourceEntitiesAdmin,
      params: {
        AppId: this.appId,
        ContentType: contentType,
      },
      streams: 'Default',
      noCamel: true,
    });
  }

  getAll(contentType: string) {
    const l = this.log.fnIf('getAll');
    const resource = this.getAllSig(contentType);
    return l.r(toObservable(resource.value, { injector: this.injector }).pipe(
      map(streams => (streams?.Default ?? []).map(query => this.#withDisplayName(query))),
    ));
  }

  getAllLive(contentType: string, refresh: Signal<unknown>) {
    this.log.fnIf('getAllLive', { contentType, refresh });
    const resource = this.getAllSig(contentType, refresh);
    return {
      ...resource,
      value: computed(() => (resource.value()?.Default ?? []).map(query => this.#withDisplayName(query))),
    };
  }

  getAllRes(contentType: string, initial?: Query[]) {
    const l = this.log.fnIf('getAllRes');
    const resource = this.getAllSig(contentType);
    const res = {
      ...resource,
      value: computed(() => (resource.value()?.Default ?? initial ?? []).map(query => this.#withDisplayName(query))),
    };
    return l.r(res);
  }

  #withDisplayName(query: Query): Query {
    const displayName = query.Title || query.Name || `Query ${query.Id}`;
    return {
      ...query,
      Name: query.Name || displayName,
      Title: query.Title || displayName,
    };
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

  clonePipelinePromise(id: number): Promise<null> {
    const l = this.log.fnIf('clonePipeline');
    const obs = this.fetchPromise<null>(webApiQueryClone, {
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
