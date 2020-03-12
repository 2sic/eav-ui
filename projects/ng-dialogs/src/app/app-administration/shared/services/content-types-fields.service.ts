import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentType } from '../models/content-type.model';
import { Field, FieldInputTypeConfig, FieldInputTypeOption, NewField } from '../models/field.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentTypesFieldsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  typeListRetrieve() {
    return <Observable<string[]>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/datatypes'), {
      params: { appid: this.context.appId.toString() }
    });
  }

  getInputTypesList() {
    return <Observable<FieldInputTypeOption[]>>(
      this.http
        .get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/inputtypes'), { params: { appid: this.context.appId.toString() } })
        .pipe(
          map((inputConfigs: FieldInputTypeConfig[]) => {
            const inputTypeOptions = inputConfigs.map(config => {
              return <FieldInputTypeOption>{
                dataType: config.Type.substring(0, config.Type.indexOf('-')),
                inputType: config.Type,
                label: config.Label,
                description: config.Description,
              };
            });
            return inputTypeOptions;
          }),
        )
    );
  }

  getFields(contentType: ContentType): Observable<Field[]> {
    return <Observable<Field[]>>this.http
      .get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/getfields'), {
        params: { appid: this.context.appId.toString(), staticName: contentType.StaticName },
      })
      .pipe(
        map((fields: Field[]) => {
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
        }),
      );
  }

  reOrder(idArray: number[], contentType: ContentType) {
    return <Observable<boolean>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/reorder'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        newSortOrder: JSON.stringify(idArray),
      },
    });
  }

  setTitle(item: Field, contentType: ContentType) {
    return <Observable<null>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/setTitle'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  rename(item: Field, contentType: ContentType, newName: string) {
    return <Observable<null>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/rename'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
        newName: newName,
      },
    });
  }

  delete(item: Field, contentType: ContentType) {
    if (item.IsTitle) {
      throw new Error('Can\'t delete Title');
    }

    return <Observable<boolean>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/deletefield'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  add(item: NewField) {
    return <Observable<number>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/addfield'), { params: <any>item });
  }

  updateInputType(id: number, staticName: string, inputType: string) {
    return <Observable<boolean>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/updateinputtype'), {
      params: { appId: this.context.appId.toString(), attributeId: id.toString(), field: staticName, inputType: inputType }
    });
  }
}
