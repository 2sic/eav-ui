import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { ContentExport } from '../models/content-export.model';

const webApiEntityRootDownload = 'admin/entity/Download';
const webApiEntityRootJson = 'admin/entity/Json';
const webApiTypeRootJson = 'admin/type/Json';
const webApiTypeRootJsonBundleExport = 'admin/type/JsonBundleExport';


@Injectable()
export class ContentExportService extends HttpServiceBase {

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

  // TODO: @2dg
  // - one one hand, this should be in a separate service BundleService
  // - ...but: it would be better to make the service just generate the URL, and then use a link in the template directly (in a _blank window)
  exportDataBundle(Guid: string) {
    const url = this.apiUrl(webApiTypeRootJsonBundleExport)
      + '?appId=' + this.appId
      + '&exportConfiguration=' + Guid
      + '&indentation=' + 1;
    window.open(url, '_blank', '');
  }

}
