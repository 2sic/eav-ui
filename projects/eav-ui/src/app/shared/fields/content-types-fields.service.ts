import { computed, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, first, map } from 'rxjs';
import { Of, transient } from '../../../../../core';
import { ContentType } from '../../app-administration/models/content-type.model';
import { webApiTypeRoot } from '../../app-administration/services';
import { calculateDataTypes, DataType } from '../../content-type-fields/edit-content-type-fields/edit-content-type-fields.helpers';
import { HttpServiceBaseSignal } from '../services/http-service-base-signal';
import { SysDataService } from '../services/sys-data.service';
import { Field, FieldInputTypeOption } from './field.model';
import { InputTypeCatalog } from './input-type-catalog';

// All WebApi paths - to easily search/find when looking for where these are used
const webApiAddInheritedField = 'admin/field/AddInheritedField';
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
export const dataSourceContentTypeDetails = 'System.ContentTypeDetails';
export const dataSourceInputTypes = 'System.InputTypes';

export interface DataTypeOption {
  Name: string;
  Value: string;
}

export interface ReservedNameOption {
  Name: string;
  Value: string;
}


@Injectable()
export class ContentTypesFieldsService extends HttpServiceBaseSignal {
  #sysData = transient(SysDataService);
  #inputTypeData = this.#sysData.getMany<{
    InputTypes?: any[];
    DataTypes?: DataTypeOption[];
    ReservedNames?: ReservedNameOption[];
  }>({
    source: dataSourceInputTypes,
    params: {
      AppId: this.appId,
    },
    streams: 'InputTypes,DataTypes,ReservedNames',
    noCamel: true,
  });

  protected paramsAppId(more: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>> = {}) {
    return {
      params: {
        appid: this.appId,
        ...more,
      },
    };
  }

  /** Get list of data types available in the system, such as 'string', 'number' etc. */
  dataTypes() {
    // Transform raw string data into rich DataType objects
    const transformedData = computed(() => {
      const rawData = this.#inputTypeData.value()?.DataTypes?.map(dataType => dataType.Value || dataType.Name) ?? [];
      if (rawData.length === 0) 
        return [];
      return calculateDataTypes(rawData);
    });
    // Return a resource object with the transformed data, loading state and error information
    return {
      value: transformedData as Signal<DataType[]>,
      loading: this.#inputTypeData.isLoading,
      error: this.#inputTypeData.error,
    };
  }

  // Returns a Signal-based resource with sorted and transformed FieldInputTypeOption objects
  getInputTypes() {
    // This extracts and formats relevant information from each input type configuration
    const mapToFieldInputTypeOption = (config: any): FieldInputTypeOption & { sort: string } => ({
      dataType: config.Type.includes('-') ? config.Type.substring(0, config.Type.indexOf('-')) : config.Type,
      inputType: config.Type,
      label: config.Label ?? config.Type,
      description: config.Description,
      isDefault: config.IsDefault,
      isObsolete: config.IsObsolete,
      isRecommended: config.IsRecommended,
      obsoleteMessage: config.ObsoleteMessage,
      icon: config.IsDefault ? 'stars' : config.IsRecommended ? 'star' : undefined,
      sort: (config.IsObsolete ? 'z' : config.IsDefault ? 'a' : config.IsRecommended ? 'b' : 'c') + (config.Label ?? config.Type),
    });

    // Create a computed signal that automatically transforms and sorts the data when it changes
    const transformedData = computed(() =>
      this.#inputTypeData.value()?.InputTypes?.map(mapToFieldInputTypeOption)
        .sort((a, b) => a.sort.localeCompare(b.sort)) || []
    );

    return {
      value: transformedData,
      loading: this.#inputTypeData.isLoading,
      error: this.#inputTypeData.error,
    };
  }

  getReservedNames() {
    const transformedData = computed(() =>
      (this.#inputTypeData.value()?.ReservedNames ?? []).reduce((reserved, current) => {
        reserved[current.Name] = current.Value;
        return reserved;
      }, {} as Record<string, string>)
    );

    return {
      value: transformedData,
      loading: this.#inputTypeData.isLoading,
      error: this.#inputTypeData.error,
    };
  }

  retrieveContentTypeFields(nameId: string) {
    const resource = this.#sysData.getMany<{ Fields?: Field[] }>({
      source: dataSourceContentTypeDetails,
      params: {
        AppId: this.appId,
        ContentTypeId: nameId,
      },
      streams: 'Default,Fields',
      noCamel: true,
    });

    return toObservable(resource.value, { injector: this.injector }).pipe(
      filter(v => v != null),
      map(streams => streams.Fields ?? []),
      first(),
    );
  }

  getFieldsLive(refresh: Signal<unknown>, contentTypeStaticName: string): Signal<Field[]> {
    const fieldsResource = this.#sysData.getMany<{ Fields?: Field[] }>({
      refresh,
      source: dataSourceContentTypeDetails,
      params: {
        AppId: this.appId,
        ContentTypeId: contentTypeStaticName,
      },
      streams: 'Default,Fields',
      noCamel: true,
    }).value;

    // Create a computed signal that processes the fetched fields
    return computed(() => {
      const fields = fieldsResource()?.Fields ?? [];
      for (const fld of fields) {
        if (!fld.Metadata) continue;
        const md = fld.Metadata;
        const allMd = md.All;
        const typeMd = md[fld.Type];
        const inputMd = md[fld.InputType];
        md.merged = { ...allMd, ...typeMd, ...inputMd };
      }
      return fields;
    });
  }
  /** Get all possible sharable fields for a new sharing */
  getShareableFieldsPromise(): Promise<Field[]> {
    return this.fetchPromise<Field[]>(webApiFieldsGetShared, {
      params: this.paramsAppId().params
    });
  }

  /**
   * Get sharable fields which are possible for this attribute.
   * Reason is that eg. a bool-attribute can only receive metadata from a bool attribute, etc.
   * @param attributeId the existing attributeId which will receive the new metadata
   */
  getShareableFieldsFor(attributeId: number) {
    return this.#getShareinfoPromise(webApiFieldsGetShared, attributeId);
  }

  getAncestors(attributeId: number) {
    return this.#getShareinfoPromise(webApiGetAncestors, attributeId);
  }

  getDescendants(attributeId: number) {
    return this.#getShareinfoPromise(webApiGetDescendants, attributeId);
  }

  #getShareinfoPromise(endpoint: string, attributeId: number): Promise<Field[]> {
    return this.fetchPromise<Field[]>(endpoint, {
      params: this.paramsAppId({ attributeId }).params
    });
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
        Id: (newField.Id).toString(),
        Type: newField.Type,
        InputType: newField.InputType,
        StaticName: newField.StaticName,
        IsTitle: (newField.IsTitle).toString(),
        Index: (newField.SortOrder).toString(),
      }
    });
  }

  updateInputType(attributeId: number, field: string, inputType: Of<typeof InputTypeCatalog>) {
    return this.http.post<boolean>(this.apiUrl(webApiInputType), null, {
      params: { appId: this.appId, attributeId, field, inputType }
    });
  }
}
