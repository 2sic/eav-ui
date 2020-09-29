import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiEntityList } from 'projects/edit';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { webApiEntityRoot } from '../../../../../edit/shared/services/entity.service';
import { Field } from '../../content-type-fields/models/field.model';
import { webApiFieldsAll } from '../../content-type-fields/services/content-types-fields.service';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { Context } from '../../shared/services/context';
import { ContentItem } from '../models/content-item.model';

@Injectable()
export class ContentItemsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll(contentTypeStaticName: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiEntityList), {
      params: { appId: this.context.appId.toString(), contentType: contentTypeStaticName }
    }) as Observable<ContentItem[]>;
  }

  getColumns(contentTypeStaticName: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiFieldsAll), {
      params: { appId: this.context.appId.toString(), staticName: contentTypeStaticName }
    }) as Observable<Field[]>;
  }

  importItem(file: File) {
    return from(toBase64(file)).pipe(
      mergeMap(fileBase64 => {
        return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'upload'), {
          AppId: this.context.appId.toString(),
          ContentBase64: fileBase64,
        }) as Observable<boolean>;
      })
    );
  }
}
