import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { AnalyzePart, SettingsStackItem } from '../sub-dialogs/analyze-settings/analyze-settings.models';
import { HttpServiceBase } from '../../shared/services/http-service-base';

@Injectable()
export class AnalyzeSettingsService extends HttpServiceBase {

  getStack(part: AnalyzePart, key?: string, view?: string, stringifyValue = false): Observable<SettingsStackItem[]> {
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
