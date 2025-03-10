import { Injectable, Signal } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { webApiFieldsAll } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { classLog } from '../../shared/logging';
import { webApiEntityList, webApiEntityRoot } from '../../shared/services/entity.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { ContentItem } from '../models/content-item.model';

const logSpecs = {
  getAll: true,
  getAllSig: true,
}

@Injectable()
export class ContentItemsService extends HttpServiceBase {

  log = classLog({ ContentItemsService }, logSpecs);

  getAll(contentTypeStaticName: string) {
    this.log.fnIf('getAll', { contentTypeStaticName });
    return this.getHttpApiUrl<ContentItem[]>(webApiEntityList, {
      params: { appId: this.appId, contentType: contentTypeStaticName }
    });
  }

  getAllSig(contentTypeStaticName: string, initial: undefined): Signal<ContentItem[]> {
    this.log.fnIf('getAllSig', { contentTypeStaticName, initial });
    return this.getSignal<ContentItem[]>(webApiEntityList, {
      params: { appId: this.appId, contentType: contentTypeStaticName }
    }, initial);
  }

  getColumns(contentTypeStaticName: string) {
    return this.getHttpApiUrl<Field[]>(webApiFieldsAll, {
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
