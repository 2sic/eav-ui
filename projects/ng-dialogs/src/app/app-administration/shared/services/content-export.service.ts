import { Injectable } from '@angular/core';

import { ContentExport } from '../models/content-export.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentExportService {
  constructor(
    private context: Context,
  ) { }

  exportContent(values: ContentExport, selectedIds: number[]) {
    const selectedIdsString = selectedIds ? '&selectedids=' + selectedIds.join() : '';
    const url = '/desktopmodules/2sxc/api/eav/ContentExport/ExportContent'
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
    const url = '/desktopmodules/2sxc/api/eav/ContentExport/DownloadTypeAsJson'
      + '?appId=' + this.context.appId
      + '&name=' + typeName;

    window.open(url, '_blank', '');
  }

}
