import { computed, Injectable, Signal } from '@angular/core';
import { Of } from '../../../../../core';
import { ContentType } from '../../app-administration/models/content-type.model';
import { webApiTypeRoot } from '../../app-administration/services';
import { calculateDataTypes, DataType } from '../../content-type-fields/edit-content-type-fields/edit-content-type-fields.helpers';
import { HttpServiceBaseSignal } from '../services/http-service-base-signal';
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
export class ContentTypesFieldsService extends HttpServiceBaseSignal {

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
    const resourceRef = this.newHttpResource<string[]>(() => ({
      url: this.apiUrl(webApiDataTypes),
      params: this.paramsAppId().params,
    }));
    // Transform raw string data into rich DataType objects
    const transformedData = computed(() => {
      const rawData = resourceRef.value();
      if (!rawData) return [];
      return calculateDataTypes(rawData);
    });
    // Return a resource object with the transformed data, loading state and error information
    return {
      value: transformedData as Signal<DataType[]>,
      loading: resourceRef.isLoading,
      error: resourceRef.error,
    };
  }

  // Returns a Signal-based resource with sorted and transformed FieldInputTypeOption objects
  getInputTypes() {
    const resourceRef = this.newHttpResource<InputTypeMetadata[]>(() => ({
      url: this.apiUrl(webApiInputTypes),
      params: this.paramsAppId().params,
    }));

    // This extracts and formats relevant information from each input type configuration
    const mapToFieldInputTypeOption = (config: InputTypeMetadata): FieldInputTypeOption & { sort: string } => ({
      dataType: config.Type.substring(0, config.Type.indexOf('-')),
      inputType: config.Type,
      label: config.Label,
      description: config.Description,
      isDefault: config.IsDefault,
      isObsolete: config.IsObsolete,
      isRecommended: config.IsRecommended,
      obsoleteMessage: config.ObsoleteMessage,
      icon: config.IsDefault ? 'stars' : config.IsRecommended ? 'star' : null,
      sort: (config.IsObsolete ? 'z' : config.IsDefault ? 'a' : config.IsRecommended ? 'b' : 'c') + config.Label,
    });

    // Create a computed signal that automatically transforms and sorts the data when it changes
    const transformedData = computed(() =>
      resourceRef.value()?.map(mapToFieldInputTypeOption)
        .sort((a, b) => a.sort.localeCompare(b.sort)) || []
    );

    return {
      value: transformedData,
      loading: resourceRef.isLoading,
      error: resourceRef.error,
    };
  }

  getReservedNames() {
    return this.newHttpResource<Record<string, string>>(() => ({
      url: this.apiUrl(webApiReservedNames),
    }));
  }

  getFieldsLive(refresh: Signal<unknown>, contentTypeStaticName: string): Signal<Field[]> {
    // Create the HTTP resource that will fetch the fields
    const fieldsResource = this.newHttpResource<Field[]>(() => {
      // Reference the refresh signal to trigger refetching when it changes
      refresh();
      return {
        url: this.apiUrl(webApiFieldsAll),
        params: this.paramsAppId({ staticName: contentTypeStaticName }).params,
      };
    }).value;

    // Create a computed signal that processes the fetched fields
    return computed(() => {
      // Get the current state of the fields resource
      const state = fieldsResource();

      // Process fields just like in the Promise version
      const fields = state || [];
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

  /** Get all fields for some content type */
  getFieldsPromise(contentTypeStaticName: string): Promise<Field[]> {
    return this.fetchPromise<Field[]>(
      webApiFieldsAll,
      this.paramsAppId({ staticName: contentTypeStaticName })
    ).then(fields => {
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
