import { Injectable } from '@angular/core';

import { ContentExport } from '../models/content-export.model';

@Injectable()
export class ContentExportService {
  constructor() { }

  exportContent(values: ContentExport, selectedIds: any[]) {
    const selectedIdsString = selectedIds ? '&selectedids=' + selectedIds.join() : '';
    const url = '/desktopmodules/2sxc/api/eav/ContentExport/ExportContent'
      + '?appId=' + values.appId
      + '&language=' + values.language
      + '&defaultLanguage=' + values.defaultLanguage
      + '&contentType=' + values.contentTypeStaticName
      + '&recordExport=' + values.recordExport
      + '&resourcesReferences=' + values.resourcesReferences
      + '&languageReferences=' + values.languageReferences
      + selectedIdsString;

    window.open(url, '_blank', '');
  }

  exportJson(appId: number, typeName: string) {
    const url = '/desktopmodules/2sxc/api/eav/ContentExport/DownloadTypeAsJson'
      + '?appId=' + appId
      + '&name=' + typeName;

    window.open(url, '_blank', '');
  }

}
