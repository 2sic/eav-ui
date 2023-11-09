import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ContentType } from '../../app-administration/models/content-type.model';
import { webApiTypeRoot } from '../../app-administration/services/content-types.service';
import { Context } from '../../shared/services/context';
import { Field, FieldInputTypeOption } from '../models/field.model';
import { InputType } from '../models/input-type.model';
import { ReservedNames } from '../models/reserved-names.model';
import { InputTypeStrict } from '../constants/input-type.constants';

export const webApiFieldsRoot = 'admin/field/';
export const webApiFieldsAll = 'admin/field/all';
export const webApiFieldsGetShared = 'admin/field/GetSharedFields';

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
              icon: config.IsDefault ? 'star' : config.IsRecommended ? 'star_outline' : null,
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

  /** Get all fields for some content type */
  getFields(contentTypeStaticName: string) {
    return this.http
      .get<Field[]>(this.apiUrl(webApiFieldsAll), {
        params: { appid: this.context.appId.toString(), staticName: contentTypeStaticName },
      })
      .pipe(
        // TODO: @SDV - duplicate code is bad
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
          console.log('2dm - getFields', fields);
          return fields;
        }),
      );
  }

  /** Get all possible sharable fields for a new sharing */
  getShareableFields() {
    return this.http.get<Field[]>(this.apiUrl(webApiFieldsGetShared), {
        params: { appid: this.context.appId.toString() },
      });
  }

  /**
   * Get sharable fields which are possible for this attribute.
   * 
   * Reason is that eg. a bool-attribute can only receive metadata from a bool attribute, etc.
   * 
   * @param attributeId the existing attributeId which will receive the new metadata
   */
  getShareableFieldsFor(attributeId: number) {
    // TODO: @SDV - do the same as in getShareableFields()
    // but add parameter attributeId to the webapi call
    // I'll create the backend afterwards
    return this.http
      .get<Field[]>(this.apiUrl(webApiFieldsGetShared), {
        params: { appid: this.context.appId.toString(), attributeId: attributeId.toString() },
      });
  }

  addInheritedField(targetContentTypeId: number, sourceContentTypeStaticName: string, sourceFieldGuid: string, newName: string) {
    console.log("SDV - addInheritedField API not implemented yet", targetContentTypeId, sourceContentTypeStaticName, sourceFieldGuid, newName);
  }

  share(attributeId: number, share: boolean = true) {
    return this.http.post<null>(this.apiUrl(webApiFieldsRoot + 'Share'), null, {
      params: {
        appid: this.context.appId.toString(),
        attributeId: attributeId.toString(),
        share,
      },
    });
  }

  inherit(attributeId: number, sourceFieldGuid: string) {
    return this.http.post<null>(this.apiUrl(webApiFieldsRoot + 'Inherit'), null, {
      params: {
        appid: this.context.appId.toString(),
        attributeId: attributeId.toString(),
        inheritMetadataOf: sourceFieldGuid,
      },
    });
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

  updateInputType(id: number, staticName: string, inputType: InputTypeStrict) {
    return this.http.post<boolean>(this.apiUrl(webApiFieldsRoot + 'InputType'), null, {
      params: { appId: this.context.appId.toString(), attributeId: id.toString(), field: staticName, inputType }
    });
  }
}
