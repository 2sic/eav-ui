import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppInternals } from '../../app-administration/models/app-internals.model';
import { MetadataKeyType } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';

const webApiRoot = 'admin/appinternals/get';

@Injectable()
export class AppInternalsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /**
   * Fetches AppInternals for given key
   * @param targetType type of target metadata item is for, e.g. for Entity, or ContentType
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of target metadata item is for
   * @param contentTypeName name of content type where permissions are stored. If blank, backend returns all metadata except permissions
   */
  getAppInternals(targetType: number, keyType: MetadataKeyType, key: string | number, contentTypeName?: string): Observable<AppInternals> {
    return this.http.get<AppInternals>(this.dnnContext.$2sxc.http.apiUrl(webApiRoot), {
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
