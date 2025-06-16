import { Injectable } from '@angular/core';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentExport } from '../models/content-export.model';

const webApiEntityRootDownload = 'admin/entity/Download';
const webApiEntityRootJson = 'admin/entity/Json';
const webApiTypeRootJson = 'admin/type/Json';


@Injectable()
export class ContentExportService extends HttpServiceBaseSignal {

  exportContent(values: ContentExport, selectedIds: number[]) {
    const selectedIdsString = selectedIds ? '&selectedids=' + selectedIds.join() : '';
    const url = this.apiUrl(webApiEntityRootDownload)
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
    const url = this.apiUrl(webApiTypeRootJson)
      + '?appId=' + this.appId
      + '&name=' + typeName;

    window.open(url, '_blank', '');
  }

  exportEntity(id: number, prefix: string, metadata: boolean) {
    const url = this.apiUrl(webApiEntityRootJson)
      + '?appId=' + this.appId
      + '&id=' + id
      + '&prefix=' + prefix
      + '&withMetadata=' + metadata;

    window.open(url, '_blank', '');
  }

}
