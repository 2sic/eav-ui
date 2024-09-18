import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ContentType } from '../../app-administration/models/content-type.model';
import { webApiTypeRoot } from '../../app-administration/services/content-types.service';
import { Field, FieldInputTypeOption } from './field.model';
import { InputTypeMetadata } from './input-type-metadata.model';
import { InputTypeStrict } from './input-type-catalog';
import { HttpServiceBase } from '../services/http-service-base';

export const webApiFieldsRoot = 'admin/field/';
export const webApiFieldsAll = 'admin/field/all';
export const webApiFieldsGetShared = 'admin/field/GetSharedFields';

@Injectable()
export class ContentTypesFieldsService extends HttpServiceBase {

  typeListRetrieve() {
    return this.http.get<string[]>(this.apiUrl(webApiFieldsRoot + 'DataTypes'), {
      params: { appid: this.appId }
    });
  }

  getInputTypesList() {
    return this.http
      .get<InputTypeMetadata[]>(this.apiUrl(webApiFieldsRoot + 'InputTypes'), { params: { appid: this.appId } })
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
    return this.http.get<Record<string, string>>(this.apiUrl(webApiFieldsRoot + 'ReservedNames'));
  }

  /** Get all fields for some content type */
  getFields(contentTypeStaticName: string) {
    return this.http
      .get<Field[]>(this.apiUrl(webApiFieldsAll), {
        params: { appid: this.appId, staticName: contentTypeStaticName },
      })
      .pipe(
        map(fields => {
          if (fields) {
            for (const fld of fields) {
              if (!fld.Metadata) continue;
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

  /** Get all possible sharable fields for a new sharing */
  getShareableFields() {
    return this.http.get<Field[]>(this.apiUrl(webApiFieldsGetShared), {
      params: { appid: this.appId },
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
        params: { appid: this.appId, attributeId: attributeId.toString() },
      });
  }

  addInheritedField(targetContentTypeId: number, sourceContentTypeStaticName: string, sourceFieldGuid: string, newName: string) {
    return this.http.post<number>(this.apiUrl(webApiFieldsRoot + 'AddInheritedField'), null, {
      params: {
        AppId: this.appId,
        ContentTypeId: targetContentTypeId.toString(),
        SourceType: sourceContentTypeStaticName,
        SourceField: sourceFieldGuid,
        name: newName,
      }
    });
  }

  share(attributeId: number, share: boolean = true) {
    return this.http.post<null>(this.apiUrl(webApiFieldsRoot + 'Share'), null, {
      params: {
        appid: this.appId,
        attributeId: attributeId.toString(),
        share,
      },
    });
  }

  inherit(attributeId: number, sourceFieldGuid: string) {
    return this.http.post<null>(this.apiUrl(webApiFieldsRoot + 'Inherit'), null, {
      params: {
        appid: this.appId,
        attributeId: attributeId.toString(),
        inheritMetadataOf: sourceFieldGuid,
      },
    });
  }

  reOrder(idArray: number[], contentType: ContentType) {
    return this.http.post<boolean>(this.apiUrl(webApiFieldsRoot + 'Sort'), null, {
      params: {
        appid: this.appId,
        contentTypeId: contentType.Id.toString(),
        order: JSON.stringify(idArray),
      },
    });
  }

  setTitle(item: Field, contentType: ContentType) {
    return this.http.post<null>(this.apiUrl(webApiTypeRoot + 'SetTitle'), null, {
      params: {
        appid: this.appId,
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  rename(fieldId: number, contentTypeId: number, newName: string) {
    return this.http.post<null>(this.apiUrl(webApiFieldsRoot + 'Rename'), null, {
      params: {
        appid: this.appId,
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
        appid: this.appId,
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  add(newField: Partial<Field>, contentTypeId: number) {
    return this.http.post<number>(this.apiUrl(webApiFieldsRoot + 'Add'), null, {
      params: {
        AppId: this.appId,
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
      params: { appId: this.appId, attributeId: id.toString(), field: staticName, inputType }
    });
  }
}
