import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Of } from '../../../../../core';
import { MetadataDto } from '../../metadata';
import { MetadataKeyTypes } from '../../shared/constants/eav.constants';
import { HttpServiceBase } from '../../shared/services/http-service-base';

const webApiRoot = 'admin/metadata/get';

@Injectable()
export class MetadataService extends HttpServiceBase {
  /**
   * Fetches metadata for given key in metadata content type
   * @param targetType type of target metadata item is for, e.g. for Entity, or ContentType
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of target metadata item is for
   * @param contentTypeName name of content type where permissions are stored. If blank, backend returns all metadata except permissions
   */
  getMetadata(targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string | number, contentTypeName?: string): Observable<MetadataDto> {
    return this.getHttp<MetadataDto>(webApiRoot, {
      params: {
        appId: this.appId,
        targetType: targetType.toString(),
        keyType,
        key: key.toString(),
        ...(contentTypeName && { contentType: contentTypeName }),
      },
    });
  }
}
