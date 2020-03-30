import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/context/context';

@Injectable()
export class MetadataService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  /**
   * Fetches metadata for given key in metadata content type
   * @param typeId metadataOf something. For more info checkout out eavConstants file
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of content type for which we search for permissions. Key is connected with keyType
   * @param contentTypeName name of content type where permissions are stored
   */
  getMetadata(typeId: number, keyType: string, key: string, contentTypeName: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/metadata/get'), {
      params: {
        appId: this.context.appId.toString(),
        targetType: typeId.toString(),
        keyType,
        key,
        contentType: contentTypeName,
      },
    });
  }
}
