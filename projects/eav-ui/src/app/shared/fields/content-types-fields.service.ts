import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Of } from '../../../../../core';
import { ContentType } from '../../app-administration/models/content-type.model';
import { webApiTypeRoot } from '../../app-administration/services';
import { HttpServiceBase } from '../services/http-service-base';
import { Field, FieldInputTypeOption } from './field.model';
import { InputTypeCatalog } from './input-type-catalog';
import { InputTypeMetadata } from './input-type-metadata.model';

export const webApiFieldsAll = 'admin/field/all';

// All WebApi paths - to easily search/find when looking for where these are used
const webApiDataTypes = 'admin/field/DataTypes';
const webApiReservedNames = 'admin/field/ReservedNames';
const webApiAddInheritedField = 'admin/field/AddInheritedField';
const webApiInputTypes = 'admin/field/InputTypes';
const webApiInputType = 'admin/field/InputType';
const webApiShare = 'admin/field/Share';
const webApiInherit = 'admin/field/Inherit';
const webApiSort = 'admin/field/Sort';
const webApiSetTitle = webApiTypeRoot + 'SetTitle';
const webApiRename = 'admin/field/Rename';
const webApiDelete = 'admin/field/Delete';
const webApiAdd = 'admin/field/Add';
const webApiFieldsGetShared = 'admin/field/GetSharedFields';
const webApiGetAncestors = 'admin/field/GetAncestors';
const webApiGetDescendants = 'admin/field/GetDescendants';


@Injectable()
export class ContentTypesFieldsService extends HttpServiceBase {

  protected paramsAppId(more: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {}) {
    return {
      params: {
        appid: this.appId,
        ...more,
      },
    };
  }

  typeListRetrieve() {
    return this.getHttp<string[]>(this.apiUrl(webApiDataTypes), this.paramsAppId());
  }

  getInputTypesList() {
    return this.http
      .get<InputTypeMetadata[]>(this.apiUrl(webApiInputTypes), this.paramsAppId())
      .pipe(
        map(inputConfigs => {
          const inputTypeOptions = inputConfigs.map(config => ({
            dataType: config.Type.substring(0, config.Type.indexOf('-')),
            inputType: config.Type,
            label: config.Label,
            description: config.Description,
            isDefault: config.IsDefault,
            isObsolete: config.IsObsolete,
            isRecommended: config.IsRecommended,
            obsoleteMessage: config.ObsoleteMessage,
            icon: config.IsDefault ? 'star' : config.IsRecommended ? 'star_outline' : null,
          } satisfies FieldInputTypeOption));
          return inputTypeOptions;
        }),
      );
  }

  getReservedNames() {
    return this.getHttp<Record<string, string>>(this.apiUrl(webApiReservedNames));
  }

  /** Get all fields for some content type */
  getFields(contentTypeStaticName: string) {
    return this.http
      .get<Field[]>(this.apiUrl(webApiFieldsAll), this.paramsAppId({ staticName: contentTypeStaticName }))
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
    return this.getHttp<Field[]>(this.apiUrl(webApiFieldsGetShared), this.paramsAppId());
  }

  /**
   * Get sharable fields which are possible for this attribute.
   * Reason is that eg. a bool-attribute can only receive metadata from a bool attribute, etc.
   * @param attributeId the existing attributeId which will receive the new metadata
   */
  getShareableFieldsFor(attributeId: number) {
    return this.#getShareinfo(webApiFieldsGetShared, attributeId);
    // return this.getHttp<Field[]>(this.apiUrl(webApiFieldsGetShared), this.paramsAppId({ attributeId }));
  }

  getAncestors(attributeId: number) {
    return this.#getShareinfo(webApiGetAncestors, attributeId);
  }

  getDescendants(attributeId: number) {
    return this.#getShareinfo(webApiGetDescendants, attributeId);
  }

  #getShareinfo(endpoint: string, attributeId: number) {
    return this.getHttp<Field[]>(this.apiUrl(endpoint), this.paramsAppId({ attributeId }));
  }

  addInheritedField(targetContentTypeId: number, sourceType: string, sourceFieldGuid: string /* guid */, name: string) {
    return this.http.post<number>(this.apiUrl(webApiAddInheritedField), null, this.paramsAppId({
      contentTypeId: targetContentTypeId.toString(),
      sourceType,
      sourceField: sourceFieldGuid,
      name,
    }));
  }

  share(attributeId: number, share: boolean = true) {
    return this.http.post<null>(this.apiUrl(webApiShare), null, {
      params: {
        appid: this.appId,
        attributeId: attributeId.toString(),
        share,
      },
    });
  }

  inherit(attributeId: number, sourceFieldGuid: string) {
    return this.http.post<null>(this.apiUrl(webApiInherit), null, {
      params: {
        appid: this.appId,
        attributeId: attributeId.toString(),
        inheritMetadataOf: sourceFieldGuid,
      },
    });
  }

  reOrder(idArray: number[], contentType: ContentType) {
    return this.http.post<boolean>(this.apiUrl(webApiSort), null, {
      params: {
        appid: this.appId,
        contentTypeId: contentType.Id.toString(),
        order: JSON.stringify(idArray),
      },
    });
  }

  setTitle(item: Field, contentType: ContentType) {
    return this.http.post<null>(this.apiUrl(webApiSetTitle), null, {
      params: {
        appid: this.appId,
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  rename(fieldId: number, contentTypeId: number, newName: string) {
    return this.http.post<null>(this.apiUrl(webApiRename), null, {
      params: {
        appid: this.appId,
        contentTypeId: contentTypeId.toString(),
        attributeId: fieldId.toString(),
        newName,
      },
    });
  }

  delete(item: Field, contentType: ContentType) {
    if (item.IsTitle)
      throw new Error('Can\'t delete Title');

    return this.http.delete<boolean>(this.apiUrl(webApiDelete), {
      params: {
        appid: this.appId,
        contentTypeId: contentType.Id.toString(),
        attributeId: item.Id.toString(),
      },
    });
  }

  add(newField: Partial<Field>, contentTypeId: number) {
    return this.http.post<number>(this.apiUrl(webApiAdd), null, {
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

  updateInputType(attributeId: number, field: string, inputType: Of<typeof InputTypeCatalog>) {
    return this.http.post<boolean>(this.apiUrl(webApiInputType), null, {
      params: { appId: this.appId, attributeId, field, inputType }
    });
  }
}
