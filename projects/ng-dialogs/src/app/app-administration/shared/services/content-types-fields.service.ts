import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ContentType } from '../models/content-type.model';
import { Field } from '../models/field.model';

@Injectable()
export class ContentTypesFieldsService {
  constructor(
    private http: HttpClient,
  ) { }

  getFields(appId: number, contentType: ContentType) {
    return this.http.get('/desktopmodules/2sxc/api/eav/contenttype/getfields',
      { params: { appid: appId.toString(), staticName: contentType.StaticName } })
      .pipe(map((fields: Field[]) => {
        if (fields) {
          for (let i = 0; i < fields.length; i++) {
            const fld = fields[i];
            if (!fld.Metadata) { continue; }
            const md = fld.Metadata;
            const allMd = md.All;
            const typeMd = md[fld.Type];
            const inputMd = md[fld.InputType];
            md.merged = { ...allMd, ...typeMd, ...inputMd };
          }
        }
        return fields;
      }));
  }

  reOrder(appId: number, idArray: number[], contentType: ContentType) {
    console.log(idArray);
    return this.http.get('/desktopmodules/2sxc/api/eav/contenttype/reorder',
      { params: { appid: appId.toString(), contentTypeId: contentType.Id.toString(), newSortOrder: JSON.stringify(idArray) } });
  }
}
