import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ContentType } from '../../app-administration/models/content-type.model';
import { webApiTypeRoot } from '../../app-administration/services/content-types.service';
import { Context } from '../../shared/services/context';
import { Field, FieldInputTypeOption } from '../models/field.model';
import { InputType } from '../models/input-type.model';
import { ReservedNames } from '../models/reserved-names.model';

export const webApiFieldsRoot = 'admin/field/';
export const webApiFieldsAll = webApiFieldsRoot + 'all';

@Injectable()
export class ContentTypesFieldsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  private apiUrl(name: string) {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  typeListRetrieve() {
    return this.http.get<string[]>(this.apiUrl(webApiFieldsRoot + 'DataTypes'), {
      params: { appid: this.context.appId.toString() }
    });
  }

  getInputTypesList() {
    return this.http
      .get<InputType[]>(this.apiUrl(webApiFieldsRoot + 'InputTypes'), { params: { appid: this.context.appId.toString() } })
      .pipe(
        map(inputConfigs => {
          const inputTypeOptions = inputConfigs.map(config => {
            const option: FieldInputTypeOption = {
              dataType: config.Type.substring(0, config.Type.indexOf('-')),
              inputType: config.Type,
              label: config.Label,
              description: config.Description,
              isDefault: config.IsDefault,
              isObsolete: config.IsObsolete,
              isRecommended: config.IsRecommended,
              obsoleteMessage: config.ObsoleteMessage,
              icon: config.IsDefault ? 'star' : config.IsRecommended ? 'star_outlined' : null,
            };
            return option;
          });
          return inputTypeOptions;
        }),
      );
  }

  getReservedNames() {
    return this.http.get<ReservedNames>(this.apiUrl(webApiFieldsRoot + 'ReservedNames'));
  }

  getFields(contentTypeStaticName: string) {
    return this.http
      .get<Field[]>(this.apiUrl(webApiFieldsAll), {
        params: { appid: this.context.appId.toString(), staticName: contentTypeStaticName },
      })
      .pipe(
        map(fields => {
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
      );
  }

  reOrder(idArray: number[], contentType: ContentType) {
    return this.http.post<boolean>(this.apiUrl(webApiFieldsRoot + 'Sort'), null, {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        order: JSON.stringify(idArray),
      },
    });
  }

  setTitle(item: Field, contentType: ContentType) {
    return this.http.post<null>(this.apiUrl(webApiTypeRoot + 'SetTitle'), null, {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  rename(fieldId: number, contentTypeId: number, newName: string) {
    return this.http.post<null>(this.apiUrl(webApiFieldsRoot + 'Rename'), null, {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentTypeId.toString(),
        attributeId: fieldId.toString(),
        newName,
      },
    });
  }

  delete(item: Field, contentType: ContentType) {
    if (item.IsTitle) {
      throw new Error('Can\'t delete Title');
    }

    return this.http.delete<boolean>(this.apiUrl(webApiFieldsRoot + 'Delete'), {
      params: {
        appid: this.context.appId.toString(),
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  add(newField: Partial<Field>, contentTypeId: number) {
    return this.http.post<number>(this.apiUrl(webApiFieldsRoot + 'Add'), null, {
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
    });
  }

  updateInputType(id: number, staticName: string, inputType: string) {
    return this.http.post<boolean>(this.apiUrl(webApiFieldsRoot + 'InputType'), null, {
      params: { appId: this.context.appId.toString(), attributeId: id.toString(), field: staticName, inputType }
    });
  }
}
