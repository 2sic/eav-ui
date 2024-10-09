import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Of } from '../../../../../core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { AnalyzeParts, SettingsStackItem } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Injectable()
export class AnalyzeSettingsService extends HttpServiceBase {

  getStack(part: Of<typeof AnalyzeParts>, key?: string, view?: string, stringifyValue = false): Observable<SettingsStackItem[]> {
    return this.http.get<SettingsStackItem[]>(
      this.apiUrl(webApiAppRoot + 'GetStack'),{
      params: {
        appId: this.appId,
        part,
        ...(key && { key }),
        ...(view && { view }),
      },
    }).pipe(
      map(stack => {
        if (!stringifyValue) { return stack; }

        for (const stackItem of stack) {
          stackItem._value = JSON.stringify(stackItem.Value);
        }
        return stack;
      }),
    );
  }
}
