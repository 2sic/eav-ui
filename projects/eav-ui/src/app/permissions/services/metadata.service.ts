import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Metadata } from '../../metadata';
import { MetadataKeyType } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';

const webApiRoot = 'admin/metadata/get';
const webApiRootAppInternals = 'admin/appinternals/get';

@Injectable()
export class MetadataService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /**
   * Fetches metadata for given key in metadata content type
   * @param targetType type of target metadata item is for, e.g. for Entity, or ContentType
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of target metadata item is for
   * @param contentTypeName name of content type where permissions are stored. If blank, backend returns all metadata except permissions
   */
  getMetadata(targetType: number, keyType: MetadataKeyType, key: string | number, contentTypeName?: string): Observable<Metadata> {
    return this.http.get<Metadata>(this.dnnContext.$2sxc.http.apiUrl(webApiRoot), {
      params: {
        appId: this.context.appId.toString(),
        targetType: targetType.toString(),
        keyType,
        key: key.toString(),
        ...(contentTypeName && { contentType: contentTypeName }),
      },
    });
  }

  /**
   * Fetches metadata for given key in metadata content type
   * @param targetType type of target metadata item is for, e.g. for Entity, or ContentType
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of target metadata item is for
   * @param contentTypeName name of content type where permissions are stored. If blank, backend returns all metadata except permissions
   */
  getAppInternals(targetType: number, keyType: MetadataKeyType, key: string | number, contentTypeName?: string): Observable<any> {
    return this.http.get<any>(this.dnnContext.$2sxc.http.apiUrl(webApiRootAppInternals), {
      params: {
        appId: this.context.appId.toString(),
        targetType: targetType.toString(),
        keyType,
        key: key.toString(),
        ...(contentTypeName && { contentType: contentTypeName }),
      },
    });
  }
}
