import { computed, Injectable, Signal } from '@angular/core';
import { Of, transient } from '../../../../../core';
import { SysDataService } from '../../shared/services/sys-data.service';
import { AnalyzeParts, SettingsStackItem } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Injectable()
export class AnalyzeSettingsService {
  #sysData = transient(SysDataService);

  getStack(part: Of<typeof AnalyzeParts>, key?: string, view?: string | Signal<string | undefined>) {
    return this.#sysData.get<SettingsStackItem>({
      source: 'System.SystemStack',
      noCamel: true,
      params: computed(() => ({
        StackNames: part,
        ...(key && { Keys: key }),
        ...(this.#viewValue(view) && { View: this.#viewValue(view) }),
      })),
    });
  }

  #viewValue(view?: string | Signal<string | undefined>) {
    return typeof view === 'function' ? view() : view;
  }
}
