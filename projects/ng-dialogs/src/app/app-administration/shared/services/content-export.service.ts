import { Injectable } from '@angular/core';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentExport } from '../models/content-export.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentExportService {
  constructor(private context: Context, private dnnContext: DnnContext) { }

  exportContent(values: ContentExport, selectedIds: number[]) {
    const selectedIdsString = selectedIds ? '&selectedids=' + selectedIds.join() : '';
    const url = this.dnnContext.$2sxc.http.apiUrl('eav/ContentExport/ExportContent')
      + '?appId=' + this.context.appId
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
    const url = this.dnnContext.$2sxc.http.apiUrl('eav/ContentExport/DownloadTypeAsJson')
      + '?appId=' + this.context.appId
      + '&name=' + typeName;

    window.open(url, '_blank', '');
  }

  exportEntity(id: number, prefix: string, metadata: boolean) {
    const url = this.dnnContext.$2sxc.http.apiUrl('eav/ContentExport/DownloadEntityAsJson')
      + '?appId=' + this.context.appId
      + '&id=' + id
      + '&prefix=' + prefix
      + '&withMetadata=' + metadata;

    window.open(url, '_blank', '');
  }
}
