import { Injectable } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { Field } from '../../shared/fields/field.model';
import { webApiFieldsAll } from '../../shared/fields/content-types-fields.service';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { ContentItem } from '../models/content-item.model';
import { webApiEntityList, webApiEntityRoot } from '../../shared/services/entity.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';

@Injectable()
export class ContentItemsService extends HttpServiceBase {

  getAll(contentTypeStaticName: string) {
    return this.http.get<ContentItem[]>(this.apiUrl(webApiEntityList), {
      params: { appId: this.appId, contentType: contentTypeStaticName }
    });
  }

  getColumns(contentTypeStaticName: string) {
    return this.http.get<Field[]>(this.apiUrl(webApiFieldsAll), {
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
