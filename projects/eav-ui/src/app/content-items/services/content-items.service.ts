import { computed, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, first, firstValueFrom, from, map, switchMap } from 'rxjs';
import { transient } from '../../../../../core';
import { classLog } from '../../../../../shared/logging';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { dataSourceContentTypeDetails } from '../../shared/fields/content-types-fields.service';
import { Field } from '../../shared/fields/field.model';
import { toBase64 } from '../../shared/helpers/file-to-base64.helper';
import { dataSourceEntitiesAdmin, webApiEntityRoot } from '../../shared/services/entity.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { ContentItem } from '../models/content-item.model';
import { contentItemsBasicFields, ContentItemsRetrieval, contentItemsRangeOptions } from '../models/content-items-retrieval.model';

const logSpecs = {
  getAll: true,
  getAllLive: true,
  getAllOnce: true,

}
@Injectable()
export class ContentItemsService extends HttpServiceBaseSignal {

  #sysData = transient(SysDataService);

  log = classLog({ ContentItemsService }, logSpecs);

  #getAllSig(contentTypeStaticName: string, refresh?: Signal<unknown>, retrieval?: Signal<ContentItemsRetrieval>) {
    return this.#sysData.getMany<{ Default?: ContentItem[] }>({
      refresh,
      source: dataSourceEntitiesAdmin,
      params: computed(() => {
        const selectedRange = retrieval?.().range ?? 'all';
        const range = contentItemsRangeOptions.find(option => option.value === selectedRange);
        return {
          AppId: this.appId,
          ContentType: contentTypeStaticName,
          ...(range?.top ? { '$top': range.top } : {}),
          ...(range?.orderBy ? { '$orderby': range.orderBy } : {}),
        };
      }),
      fields: computed(() => {
        const columns = retrieval?.().columns ?? 'all';
        return columns === 'all'
          ? ''
          : [...new Set([...contentItemsBasicFields, ...columns])].join(',');
      }),
      streams: 'Default',
      noCamel: true,
    });
  }

  getAllPromise(contentTypeStaticName: string): Promise<ContentItem[]> {
    this.log.fnIf('getAll', { contentTypeStaticName });
    const resource = this.#getAllSig(contentTypeStaticName);

    return firstValueFrom(
      toObservable(resource.value, { injector: this.injector }).pipe(
        filter(v => v != null),
        map(streams => streams.Default ?? []),
        first(),
      ),
    );
  }

  getAllOnce(contentTypeStaticName: string) {
    this.log.fnIf('getAllOnce', { contentTypeStaticName });
    const resource = this.#getAllSig(contentTypeStaticName);
    return {
      ...resource,
      value: computed(() => resource.value()?.Default),
    };
  }

  getAllLive(contentTypeStaticName: string, refresh: Signal<unknown>, retrieval?: Signal<ContentItemsRetrieval>) {
    this.log.fnIf('getAllLive', { contentTypeStaticName, refresh });
    const resource = this.#getAllSig(contentTypeStaticName, refresh, retrieval);
    return {
      ...resource,
      isLoading: resource.isLoading,
      error: resource.error,
      value: computed<ContentItem[] | undefined>(() => {
        const items = resource.hasValue() ? resource.value()?.Default : undefined;
        if (retrieval?.().columns === 'all')
          return items;
        return items?.map(item => ({
          ...item,
          _Title: item._Title ?? item.Title,
          _EditInfo: item._EditInfo ?? {
            ReadOnly: true,
            DisableDelete: true,
            DisableMetadata: true,
          },
        }));
      }),
    };
  }

  getColumnsPromise(contentTypeStaticName: string): Promise<Field[]> {
    const resource = this.#sysData.getMany<{ Fields?: Field[] }>({
      source: dataSourceContentTypeDetails,
      params: {
        AppId: this.appId,
        ContentTypeId: contentTypeStaticName,
      },
      streams: 'Default,Fields',
      noCamel: true,
    });

    return firstValueFrom(
      toObservable(resource.value, { injector: this.injector }).pipe(
        filter(v => v != null),
        map(streams => streams.Fields ?? []),
        first(),
      ),
    );
  }

  importItem(file: File) {
    return from(toBase64(file)).pipe(
      switchMap(fileBase64 => {
        return this.http.post<boolean>(this.apiUrl(webApiEntityRoot + 'upload'), {
          AppId: this.appId,
          ContentBase64: fileBase64,
        });
      }),
      map(success => {
        const result: FileUploadResult = {
          Success: success,
          Messages: [],
        };
        return result;
      }),
    );
  }
}
