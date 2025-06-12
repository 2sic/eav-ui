import { computed, Injectable, signal, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Of } from '../../../../../core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { AnalyzeParts, SettingsStackItem } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Injectable()
export class AnalyzeSettingsService extends HttpServiceBase {


  // TODO: 2dg, not works
  // getStackSigHttpResource(part: Of<typeof AnalyzeParts>, key?: string, view?: string) {
  //   // const stackSignal = signal<SettingsStackItem[]>([]);
  //   return this.newHttpResource<SettingsStackItem[]>(() => ({
  //     url: this.apiUrl(webApiAppRoot + 'GetStack'),
  //     params: {
  //       appId: this.appId,
  //       part,
  //       ...(key && { key }),
  //       ...(view && { view }),
  //     },
      
  //   }));
  // }

  // TEMP, not sure if this are correct
  getStackSig(part: Of<typeof AnalyzeParts>, key?: string, view?: string, stringifyValue = false): Signal<SettingsStackItem[]> {
    const stackSignal = signal<SettingsStackItem[]>([]);

    this.getAndWrite<SettingsStackItem[]>(webApiAppRoot + 'GetStack', {
      params: {
        appId: this.appId,
        part,
        ...(key && { key }),
        ...(view && { view }),
      },
    }, stackSignal);

    return computed(() => stringifyValue
      ? stackSignal().map(stackItem => ({ ...stackItem, _value: JSON.stringify(stackItem.Value) }))
      : stackSignal()
    );
  }

  getStack(part: Of<typeof AnalyzeParts>, key?: string, view?: string, stringifyValue = false): Observable<SettingsStackItem[]> {

    return this.getHttp<SettingsStackItem[]>(webApiAppRoot + 'GetStack', {
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
