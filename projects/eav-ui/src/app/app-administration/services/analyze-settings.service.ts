import { Injectable } from '@angular/core';
import { Of } from '../../../../../core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { AnalyzeParts, SettingsStackItem } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Injectable()
export class AnalyzeSettingsService extends HttpServiceBaseSignal {

  getStack(part: Of<typeof AnalyzeParts>, key?: string, view?: string) {
    return this.newHttpResource<SettingsStackItem[]>(() => ({
      url: this.apiUrl(webApiAppRoot + 'GetStack'),
      params: {
        appId: this.appId,
        part,
        ...(key && { key }),
        ...(view && { view }),
      },
    }));
  }
}
