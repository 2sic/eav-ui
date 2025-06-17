import { computed, Injectable, signal, Signal } from '@angular/core';
import { Of } from '../../../../../core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { AnalyzeParts, SettingsStackItem } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Injectable()
export class AnalyzeSettingsService extends HttpServiceBase {


  // TODO: 2dg, ask 2dm 
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

  getStackPromise(part: Of<typeof AnalyzeParts>, key?: string, view?: string, stringifyValue = false): Promise<SettingsStackItem[]> {
    return this.fetchPromise<SettingsStackItem[]>(webApiAppRoot + 'GetStack', {
      params: {
        appId: this.appId,
        part,
        ...(key && { key }),
        ...(view && { view }),
      },
    }).then(stack => {
        if (!stringifyValue) { return stack; }

        for (const stackItem of stack) {
          stackItem._value = JSON.stringify(stackItem.Value);
        }
        return stack;
      })
  }
}
