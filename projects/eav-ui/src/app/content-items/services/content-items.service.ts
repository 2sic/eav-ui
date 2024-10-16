import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { webApiFieldsAll } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { webApiEntityList, webApiEntityRoot } from '../../shared/services/entity.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { ContentItem } from '../models/content-item.model';

@Injectable()
export class ContentItemsService extends HttpServiceBase {

  getAll(contentTypeStaticName: string) {
    return this.getHttpApiUrl<ContentItem[]>(webApiEntityList, {
      params: { appId: this.appId, contentType: contentTypeStaticName }
    });
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
