import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentType } from '../models/content-type.model';
import { Field, FieldInputTypeConfig, FieldInputTypeOption } from '../models/field.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentTypesFieldsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  typeListRetrieve() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/datatypes'), {
      params: { appid: this.context.appId.toString() }
    }) as Observable<string[]>;
  }

  getInputTypesList() {
    return this.http
      .get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/inputtypes'), { params: { appid: this.context.appId.toString() } })
      .pipe(
        map((inputConfigs: FieldInputTypeConfig[]) => {
          const inputTypeOptions = inputConfigs.map(config => {
            const option: FieldInputTypeOption = {
              dataType: config.Type.substring(0, config.Type.indexOf('-')),
              inputType: config.Type,
              label: config.Label,
              description: config.Description,
            };
            return option;
          });
          return inputTypeOptions;
        }),
      ) as Observable<FieldInputTypeOption[]>;
  }

  getFields(contentType: ContentType): Observable<Field[]> {
    return this.http
      .get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/getfields'), {
        params: { appid: this.context.appId.toString(), staticName: contentType.StaticName },
      })
      .pipe(
        map((fields: Field[]) => {
          if (fields) {
            for (const fld of fields) {
              if (!fld.Metadata) { continue; }
              const md = fld.Metadata;
              const allMd = md.All;
              const typeMd = md[fld.Type];
              const inputMd = md[fld.InputType];
              md.merged = { ...allMd, ...typeMd, ...inputMd };
            }
          }
          return fields;
        }),
      ) as Observable<Field[]>;
  }

  reOrder(idArray: number[], contentType: ContentType) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/reorder'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        newSortOrder: JSON.stringify(idArray),
      },
    }) as Observable<boolean>;
  }

  setTitle(item: Field, contentType: ContentType) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/setTitle'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    }) as Observable<null>;
  }

  rename(item: Field, contentType: ContentType, newName: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/rename'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
        newName,
      },
    }) as Observable<null>;
  }

  delete(item: Field, contentType: ContentType) {
    if (item.IsTitle) {
      throw new Error('Can\'t delete Title');
    }

    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/deletefield'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    }) as Observable<boolean>;
  }

  add(newField: Partial<Field>, contentTypeId: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/addfield'), {
      params: {
        AppId: this.context.appId.toString(),
        ContentTypeId: contentTypeId.toString(),
        Id: newField.Id.toString(),
        Type: newField.Type,
        InputType: newField.InputType,
        StaticName: newField.StaticName,
        IsTitle: newField.IsTitle.toString(),
        SortOrder: newField.SortOrder.toString(),
      }
    }) as Observable<number>;
  }

  updateInputType(id: number, staticName: string, inputType: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/updateinputtype'), {
      params: { appId: this.context.appId.toString(), attributeId: id.toString(), field: staticName, inputType }
    }) as Observable<boolean>;
  }
}
