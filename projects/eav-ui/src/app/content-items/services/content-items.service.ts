import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { classLog } from '../../../../../shared/logging';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { webApiFieldsAll } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { webApiEntityList, webApiEntityRoot } from '../../shared/services/entity.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentItem } from '../models/content-item.model';

const logSpecs = {
  getAll: true,
  getAllLive: true,
  getAllOnce: true,

}
@Injectable()
export class ContentItemsService extends HttpServiceBaseSignal {

  log = classLog({ ContentItemsService }, logSpecs);
  
  getAllPromise(contentTypeStaticName: string): Promise<ContentItem[]> {
    this.log.fnIf('getAll', { contentTypeStaticName });
    return this.fetchPromise<ContentItem[]>(webApiEntityList, {
      params: { appId: this.appId, contentType: contentTypeStaticName }
    });
  }

  getAllOnce(contentTypeStaticName: string) {
    this.log.fnIf('getAllOnce', { contentTypeStaticName });
    return httpResource<ContentItem[]>(() => {
      return ({
        url: this.apiUrl(webApiEntityList),
        params: { appId: this.appId, contentType: contentTypeStaticName }
      });
    });
  }

  getAllLive(contentTypeStaticName: string, refresh: Signal<unknown>) {
    this.log.fnIf('getAllLive', { contentTypeStaticName, refresh });
    return httpResource<ContentItem[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiEntityList),
        params: { appId: this.appId, contentType: contentTypeStaticName }
      });
    });
  }

  getColumnsPromise(contentTypeStaticName: string): Promise<Field[]> {
    return this.fetchPromise<Field[]>(webApiFieldsAll, {
      params: { appId: this.appId, staticName: contentTypeStaticName }
    });
  }

  importItem(file: File) {
    return from(toBase64(file)).pipe(
      switchMap(fileBase64 => {
        return this.http.post<boolean>(this.apiUrl(webApiEntityRoot + 'upload'), {
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
}
