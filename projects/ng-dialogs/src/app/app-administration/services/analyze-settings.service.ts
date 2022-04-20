import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { Context } from '../../shared/services/context';
import { AnalyzePart, SettingsStackItem } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Injectable()
export class AnalyzeSettingsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getStack(part: AnalyzePart, key?: string, view?: string, stringifyValue = false): Observable<SettingsStackItem[]> {
    return this.http.get<SettingsStackItem[]>(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'GetStack'), {
      params: {
        appId: this.context.appId.toString(),
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
