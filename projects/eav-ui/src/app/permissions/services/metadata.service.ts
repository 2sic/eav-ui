import { computed, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { transient } from 'projects/core';
import { filter, first, firstValueFrom, map, Observable } from 'rxjs';
import { Of } from '../../../../../core';
import { MetadataDto, MetadataRecommendation } from '../../metadata';
import { MetadataKeyTypes } from '../../shared/constants/eav.constants';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SysDataService } from '../../shared/services/sys-data.service';

type MetadataRecommendationRaw = Omit<MetadataRecommendation, 'Id'> & {
  ContentTypeId?: string;
  Id?: string | number;
};
type MetadataItemRaw = MetadataDto['Items'][number] & {
  MetadataTypeId?: string;
  MetadataTypeName?: string;
  MetadataTypeTitle?: string;
  MetadataTypeDescription?: string;
};

interface MetadataStreams {
  Recommendations?: MetadataRecommendationRaw[];
  Items?: MetadataItemRaw[];
  For?: MetadataDto['For'][];
}

@Injectable()
export class MetadataService extends HttpServiceBase {
  #sysData = transient(SysDataService);

  getMetadata(targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string | number, contentTypeName?: string): Observable<MetadataDto> {
    const resource = this.#sysData.getMany<MetadataStreams>({
      source: 'System.ItemMetadata',
      streams: '*',
      noCamel: true,
      params: this.#params(targetType, keyType, key, contentTypeName),
    });
    return toObservable(resource.value, { injector: this.injector }).pipe(
      filter((result): result is MetadataStreams => result != null),
      first(),
      map(result => this.#toDto(result)),
    );
  }

  getMetadataLive(refresh: Signal<unknown>, targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string | number, contentTypeName?: string) {
    const resource = this.#sysData.getMany<MetadataStreams>({
      source: 'System.ItemMetadata',
      streams: '*',
      noCamel: true,
      refresh,
      params: computed(() => ({
        ...this.#params(targetType, keyType, key, contentTypeName),
        Refresh: String(refresh()),
      })),
    });
    return {
      ...resource,
      value: computed(() => this.#toDto(resource.value())),
    };
  }

  getMetadataPromise(targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string | number, contentTypeName?: string): Promise<MetadataDto> {
    return firstValueFrom(this.getMetadata(targetType, keyType, key, contentTypeName));
  }

  #params(targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string | number, contentTypeName?: string) {
    return {
      TargetType: targetType,
      KeyType: keyType,
      Key: key.toString(),
      ...(contentTypeName && { ContentType: contentTypeName }),
    };
  }

  #toDto(result?: MetadataStreams): MetadataDto {
    return {
      Recommendations: (result?.Recommendations ?? []).map(recommendation => ({
        ...recommendation,
        Id: recommendation.ContentTypeId ?? (typeof recommendation.Id === 'string' ? recommendation.Id : ''),
      })),
      Items: (result?.Items ?? []).map(item => ({
        ...item,
        _Type: item._Type ?? {
          Id: item.MetadataTypeId ?? '',
          Name: item.MetadataTypeName ?? '',
          Title: item.MetadataTypeTitle ?? item.MetadataTypeName ?? '',
          Description: item.MetadataTypeDescription ?? '',
        },
      })),
      For: result?.For?.[0],
    };
  }
}