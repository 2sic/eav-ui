import { Injectable } from '@angular/core';
import { webApiTypeRoot } from '../../app-administration/services/content-types.service';
import { ContentExport } from '../models/content-export.model';
import { webApiEntityRoot } from '../../shared/services/entity.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';

@Injectable()
export class ContentExportService extends HttpServiceBase {

  exportContent(values: ContentExport, selectedIds: number[]) {
    const selectedIdsString = selectedIds ? '&selectedids=' + selectedIds.join() : '';
    const url = this.apiUrl(webApiEntityRoot + 'Download')
      + '?appId=' + this.appId
      + '&language=' + values.language
      + '&defaultLanguage=' + values.defaultLanguage
      + '&contentType=' + values.contentTypeStaticName
      + '&recordExport=' + values.recordExport
      + '&resourcesReferences=' + values.resourcesReferences
      + '&languageReferences=' + values.languageReferences
      + selectedIdsString;

    window.open(url, '_blank', '');
  }

  exportJson(typeName: string) {
    const url = this.apiUrl(webApiTypeRoot + 'Json')
      + '?appId=' + this.appId
      + '&name=' + typeName;

    window.open(url, '_blank', '');
  }

  exportEntity(id: number, prefix: string, metadata: boolean) {
    const url = this.apiUrl(webApiEntityRoot + 'Json')
      + '?appId=' + this.appId
      + '&id=' + id
      + '&prefix=' + prefix
      + '&withMetadata=' + metadata;

    window.open(url, '_blank', '');
  }
}
