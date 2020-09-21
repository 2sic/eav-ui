import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContentType } from '../../app-administration/models/content-type.model';
import { webApiTypeRoot } from '../../app-administration/services/content-types.service';
import { Context } from '../../shared/services/context';
import { Field, FieldInputTypeConfig, FieldInputTypeOption } from '../models/field.model';

export const webApiFieldsRoot = 'admin/field/';
export const webApiFieldsAll = webApiFieldsRoot + 'all';

@Injectable()
export class ContentTypesFieldsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  private apiUrl(name: string): string {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  typeListRetrieve() {
    return this.http.get(this.apiUrl(webApiFieldsRoot + 'DataTypes'), {
      params: { appid: this.context.appId.toString() }
    }) as Observable<string[]>;
  }

  getInputTypesList() {
    return this.http
      .get(this.apiUrl(webApiFieldsRoot + 'InputTypes'), { params: { appid: this.context.appId.toString() } })
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

  getFields(contentType: ContentType) {
    return this.http
      .get(this.apiUrl(webApiFieldsAll), {
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
    return this.http.post(this.apiUrl(webApiFieldsRoot + 'Sort'), null, {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        order: JSON.stringify(idArray),
      },
    }) as Observable<boolean>;
  }

  setTitle(item: Field, contentType: ContentType) {
    return this.http.post(this.apiUrl(webApiTypeRoot + 'SetTitle'), null, {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    }) as Observable<null>;
  }

  rename(item: Field, contentType: ContentType, newName: string) {
    return this.http.post(this.apiUrl(webApiFieldsRoot + 'Rename'), null, {
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

    return this.http.delete(this.apiUrl(webApiFieldsRoot + 'Delete'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    }) as Observable<boolean>;
  }

  add(newField: Partial<Field>, contentTypeId: number) {
    return this.http.post(this.apiUrl(webApiFieldsRoot + 'Add'), null, {
      params: {
        AppId: this.context.appId.toString(),
        ContentTypeId: contentTypeId.toString(),
        Id: newField.Id.toString(),
        Type: newField.Type,
        InputType: newField.InputType,
        StaticName: newField.StaticName,
        IsTitle: newField.IsTitle.toString(),
        Index: newField.SortOrder.toString(),
      }
    }) as Observable<number>;
  }

  updateInputType(id: number, staticName: string, inputType: string) {
    return this.http.post(this.apiUrl(webApiFieldsRoot + 'InputType'), null, {
      params: { appId: this.context.appId.toString(), attributeId: id.toString(), field: staticName, inputType }
    }) as Observable<boolean>;
  }
}
